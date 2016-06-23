var express = require('express');
var nodemailer = require('nodemailer');


var mailSender = nodemailer.createTransport({
	// "host": "128.199.227.132",
	"service": "Gmail",
	"auth": {
		"user": "lelongking789@gmail.com",
		"pass": "Twin@@Twin"
	}
});

mailSender.sendMail({
	from: 'lelongking789@gmail.com',
	to: 'locnq@twin.vn',
	cc: '',
	subject: `Report CMS: Test report`,
	html: `<div>
              <h1>Thông báo: send Success</h1>
            </div>`
}, function (err, info) {
	if (err) { console.warn('Send mail failed!',err); return; }
	console.log('Send mail success,', info);
});