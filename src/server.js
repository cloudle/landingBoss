import express from 'express';
import fs from 'fs';
import request from 'superagent';
import nodemailer from 'nodemailer';
import { exec } from 'child_process';


let homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  urlConfigs = './configs.json', urlSites = './sites.json',
  configs = JSON.parse(fs.readFileSync(urlConfigs, 'utf8')),
  mailSender = nodemailer.createTransport(configs.gmail);

setInterval(() => {
  let siteLists = JSON.parse(fs.readFileSync('./sites.json', 'utf8'));
  getSiteConfigs(siteLists);
}, configs.time_recheck*60*1000);


function getSiteConfigs (siteLists) {
  let configPromises = [];

  for (let site of siteLists.websites) {
    configPromises.push(
      new Promise((resolve, reject) => {
        request.get(`http://${configs.server}:${site.port}/configs`)
          .then(response => {
            if (site.status == 'online') {

            }
            else if (site.status == 'offline') {
              site.status = 'online';
              site.sendMail = false;
            }

            resolve(site)
          })
          .catch((error) => {
            console.log(site)
            if (site.status == 'online') {
              site.status = 'offline';
              site.sendMail = false;
            }
            else if (site.status === 'offline') {

            }
            console.log(site)
            resolve(site)
          });
      })
    );
  }

  Promise.all(configPromises).then((data) => {
    for (let site of data)
      if (site.status == 'offline' && site.sendMail == false) {
        site.sendMail = true;

        exec(`forever start ${site.sourcepath}/server.js &`, function(error, stdout, stderr) {
          // console.log('stdout: ' + stdout);
          // console.log('stderr: ' + stderr);
          if (error !== null) {
            // console.log('exec error: ' + error);
            let serverRestart = "đã cố lỗi khi restart, Kiểm tra lại trên server."
          }
          else {
            let serverRestart = "đã restart lại."
          }

          mailSender.sendMail({
            from: configs.mailOption.mailerAccount,
            to: configs.mailOption.receiver,
            cc: '',
            subject: `Report CMS: -> website: ${site.domain}, port: ${site.port} -> chết`,
            html: `<div>
              <h1>Thông báo:</h1>
              <h3>Website ${site.domain}, port: ${site.port} -> ${serverRestart}</h3>
            </div>`
          }, function (err, info) {
            if (err) { console.warn('Send mail failed!',err); return; }
            console.log('Send mail success,', info);
          });

        });
      }

    fs.writeFileSync(urlSites, JSON.stringify({"websites":data}), 'utf-8', function (err) {})
  }, (err) => {
    console.log(`error: ${err}`)
  });
}