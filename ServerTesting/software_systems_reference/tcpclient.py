import socket
#the server name and port
#the server is on the same computer as the client

server_name = '80.7.96.89'
server_port = 12000

#create a TCP client socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

#Set up a TCP connection with the server

#a connection_socket will be assigned to this client on the server side

client_socket.connect((server_name, server_port))

print("TCP client running...")
print("Connecting to server at IP: ", server_name, " PORT: ", server_port)

for i in range (5):
    #take input from the user
    msg = input("Enter a Message:")

    #send the message  to the udp server
    client_socket.send(msg.encode())

    #return values from the server
    msg = client_socket.recv(1024)
    print(msg.decode())
client_socket.close()
