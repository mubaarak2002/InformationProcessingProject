import socketio

sio = socketio.Client()


sio.connect('http://localhost:3000')

@sio.event
def connect():
    print("I'm connected!")

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("I'm disconnected!")


@sio.on('data')
def response(*args):
    print(args[0])
    
while True:
    ins = input("Input: ")
    sio.emit("data", ins)
