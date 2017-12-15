alert('Welcome!');

socket.on('handshake', function(data) {
  console.log('received `greeting` from server');
  $('#handshake').html(data.message);
});