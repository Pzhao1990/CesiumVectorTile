var when = require('when');

function readAsArrayBuffer(file) {
    var df = when.defer();
    var fr = new FileReader();
    fr.onload = function (e) {
        df.resolve(e.target.result);
    }
    fr.onprogress = function (e) {
        if (df.progress) df.progress(e.target.result);
    }
    fr.onerror = function (e) {
        df.reject(e.error);
    }
    fr.readAsArrayBuffer(file);
    return df.promise;
}
module.exports = readAsArrayBuffer;