function(file, ellipsis) {
  const jpeg = require('jpeg-js');
const PNG = require('pngjs').PNG;
const jsQR = require("jsqr");

file.fetch().then(res => {
  decode(res).then(image => {
    const code = jsQR(image.data, image.width, image.height);
    if (code && code.data) {
      ellipsis.success(code.data);
    } else {
      const details = code ? `\n\n${code.error}` : "";
      ellipsis.error("Not a valid JPEG or PNG QR code." + details);
    }
  });
});

function decode(res) {
  return new Promise((resolve, reject) => {
    const ctype = res.contentType.toLowerCase();
    if (ctype === "image/png") {
      res.value.pipe(new PNG({ filterType: 4 })).on('parsed', function(err, data) {
        resolve(this);
      });
    } else if (ctype === "image/jpeg") {
      const bufs = [];
      res.value.on('data', function(d){ bufs.push(d); });
      res.value.on('end', function() {
        const buf = Buffer.concat(bufs);
        resolve(jpeg.decode(buf, true));
      });
    } else {
      reject(`I don't know how to read images of type: ${ctype}`);
    }
  }); 
}
}
