import socket
import os
from _thread import *

ServerSideSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

host = '146.169.236.175'
port = 12000
ThreadCount = 0

try:
    ServerSideSocket.bind((host,port))
except socket.error as e:
    print(str(e))
print('socket is listening..')
ServerSideSocket.listen(5)

def multi_threaded_client(connection):
    connection.send(str.encode('Server is working:'))
    while True:
        data = connection.recv(2048)
        response = 'Server message: ' + data.decode('utf-8')
        if not data:
            print("disconnected")
            break
        connection.sendall(str.encode(response))

   
while True:
    Client, address = ServerSideSocket.accept()
    print('Connected to: ' + address[0] + ':' + str(address[1]))
    start_new_thread(multi_threaded_client, (Client, ))
    ThreadCount += 1
    print('Thread Number: ' + str(ThreadCount))
ServerSideSocket.close()
