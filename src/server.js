import express from 'express';
import fs from 'fs';
import request from 'superagent';
import ports from '../sites';

let homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], sites = [];

getSiteConfigs((response) => {
  // console.log(response[0].body);
  console.log(sites.length);
});

function getSiteConfigs (callback) {
  let configPromises = [];

  for (let port = 7020; port <= 7027; port++) {
    let currentPromise = request.get(`http://128.199.227.132:${port}/configs`);
    currentPromise.then(response => {
      sites.push(response.body);
    });

    configPromises.push(currentPromise);
  }

  Promise.all(configPromises).then(callback)
    .catch(() => {
      console.log('Something wrong happened!');
      callback();
    });
}