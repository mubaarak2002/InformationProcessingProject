import socket
from datetime import datetime as dt

#select a server port
server_port = 12000

#create a UDP socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

#bind the server to the localhost at port server_port
server_socket.bind(('localhost',server_port))

print('UDP Server running on port ', server_port)

#Now the loop that listens from clients
#As UDP is not connection oriented,the same UDP socket serves all clients

while True:
    #cadd below is the client process address
    cmsg, cadd = server_socket.recvfrom(2048)
    cmsg = cmsg.decode()
    part1 = dt.now().strftime("%M:%S:%f")
    
    print("This is Ping Number " + cmsg)

    part2 = dt.now().strftime("%M:%S:%f")
    cmsg = part1 + "#" + part2
    #send reply message to the client process            
    server_socket.sendto(cmsg.encode(),cadd)

