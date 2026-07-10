const dns = require('dns');
dns.lookup('api.gpro.net', (err, address, family) => {
  console.log('address: %j family: IPv%s', address, family);
  if(err) console.error(err);
});
dns.lookup('gpro.net', (err, address, family) => {
  console.log('gpro address: %j', address);
});
