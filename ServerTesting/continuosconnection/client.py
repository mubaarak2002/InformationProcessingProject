from network import Network

def main():
    n = Network()
    while True:
        Input = input('Hey there: ')
        res = n.send(str.encode(Input))
        print(res.decode('utf-8'))

main()

