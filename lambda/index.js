exports.handler = function(event, context) {
  
  var gcloud = require('gcloud');
  var gce = gcloud.compute({
    projectId: 'black-pier-565',
    keyFilename: 'key.json'
  });
  
  var zone = gce.zone('asia-east1-a');
  var vm = zone.vm('instance-4');
  
  vm.start(function(err, operation, apiResponse) {
    if (err){
      console.log(err)
      context.done('fail'); 
    } else {
      context.done(null, 'success');
    }
  });
};