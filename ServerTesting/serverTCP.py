import socket
from datetime import datetime as dt
#select a server port
server_port = 12000

#create welcome socket to receive all incoming clients
welcome_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

#bind the server to the localhost
welcome_socket.bind(('0.0.0.0',server_port))

#Listen to incoming clients
welcome_socket.listen(1)

print('TCP Server running on port ', server_port)

#Now the loop that listens from clients
#For each incoming client, a seperate TCP connection is established via a connection_socket

while True:

    connection_socket, caddr = welcome_socket.accept()
    while True:
        print("starting")   
    
        #notice recv and send instead of recvto and sendto
        #this is because the 'to' part is now implicit in the connection_socket

        cmsg = connection_socket.recv(1024)  	
        cmsg = cmsg.decode()
        part1 = dt.now().strftime("%M:%S:%f")

        print("This is Ping Number " + cmsg)
        
        part2 = dt.now().strftime("%M:%S:%f")
        cmsg = part1 + "#" + part2
        #send reply message to the client process   
        connection_socket.send(cmsg.encode())
        print("message Sent")

