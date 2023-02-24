from datetime import datetime as dt
import time as t
from scipy.stats import norm
import matplotlib.pyplot as plt
import numpy as np
import socket
import statistics as stats

def processData(impulses):
    #plots all the impulses

    #establish t0, which is the time of the first impulse
    base_time = timeToDigit(impulses[0]["Start Time"])
    
    output = {}
    #timing points
    output["Start Time"] = []
    output["Return Time"] = []
    output["Recieved Time"] = []
    output["Sending Time"] = []

    #duration times
    output["Client-Server Time"] = []
    output["Server-Client Time"] = []
    output["Round Trip Time"] = []

    #iterate through all the impulses via "keys"

    #populate the four timing points
    for impulse in impulses.keys():
        for entry in impulses[impulse]:
            #entry is now the "____ Time" for all the impulses
            #time is now in milliseconds
            output[entry].append( 1000 * (timeToDigit(impulses[impulse][entry]) - base_time))
            

    for pulse in range(len(output["Start Time"])):
        output["Client-Server Time"].append(-1*(output["Start Time"][pulse] - output["Recieved Time"][pulse]))
        output["Server-Client Time"].append(-1*(output["Sending Time"][pulse] - output["Return Time"][pulse]))
        output["Round Trip Time"].append(-1*(output["Start Time"][pulse] - output["Return Time"][pulse]))

    return output

def plotPulses(data):
    for startTime in data["Start Time"]:
        plt.axvline(x = startTime, color = 'b')
    for startTime in data["Return Time"]:
        plt.axvline(x = startTime, color = 'r')

    plt.show()

def plotNormal(data, bins=10, title="data", xtitle="Responce Time (ms)"):

    plt.hist(data, bins, density=True, alpha=0.6, color='b')

    mu, std = norm.fit(data)
    xmin, xmax = plt.xlim()
    x = np.linspace(xmin, xmax, 100)
    p = norm.pdf(x, mu, std)

    title = "Sample Values for " + title + ": mean =  {:.2f} and std = {:.2f}".format(mu, std)
    plt.title(title)
    plt.xlabel(xtitle)
    plt.ylabel("Frequency")

    plt.plot(x, p, 'k', linewidth=2)
    plt.show()

def timeToDigit(timeStr):
    #timeStr is in the form mm:ss:ffffff
    #returning time as ss.ffffff
    minutes = float(timeStr.split(":")[0]) * 60
    seconds = float(timeStr.split(":")[1])
    microseconds = float(timeStr.split(":")[2]) * 0.000001

    return minutes + seconds + microseconds

def frequencySweep(criteria, bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000):


    #this function takes a parameter and sweeps accross a certain refresh rate
    #f = 1/t, thus every 0.1s = 10 Hz.
    #numSamples determines how many increments to take
    #The output is the mean responce time per frequency
    increment = (top-bottom)/steps
    frequencies = []
    means = []
    stds = []
    for i in range(steps):
        frequency = bottom + increment * i
        print(frequency)
        frequencies.append(frequency)
        mu, std = norm.fit(processData(timeAnalysis(numSamples, (1/frequency), server_name, server_port))[criteria])
        means.append(mu)
        stds.append(std)

    fig, ax1 = plt.subplots()
    ax2 = ax1.twinx()

    ax1.plot(frequencies, means, 'r', label = "Sample Means")
    ax2.plot(frequencies, stds, 'b', label = "Standard Deviations")

    title = "Mean " + criteria + " over Varying Pinging Frequencies from {:.2f} Hz to {:.2f} Hz".format(bottom, top)
    plt.title(title)
    plt.xlabel("Frequency")
    ax1.set_ylabel('Mean Responce Time (ms)', color='r')
    ax2.set_ylabel('Standard Deviation of Sample (ms)', color='b')


    ax1.legend(loc='upper right')
   #ax2.legend(loc='upper right')

    plt.show()

def frequencySweepTCP(criteria, bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000):


    #this function takes a parameter and sweeps accross a certain refresh rate
    #f = 1/t, thus every 0.1s = 10 Hz.
    #numSamples determines how many increments to take
    #The output is the mean responce time per frequency
    increment = (top-bottom)/steps
    frequencies = []
    means = []
    stds = []
    for i in range(steps):
        frequency = bottom + increment * i
        print(frequency)
        frequencies.append(frequency)
        mu, std = norm.fit(processData(timeAnalysisTCP(numSamples, (1/frequency), server_name, server_port))[criteria])
        means.append(mu)
        stds.append(std)

    fig, ax1 = plt.subplots()
    ax2 = ax1.twinx()

    ax1.plot(frequencies, means, 'r', label = "Sample Means")
    ax2.plot(frequencies, stds, 'b', label = "Standard Deviations")

    title = "Mean " + criteria + " over Varying Pinging Frequencies from {:.2f} Hz to {:.2f} Hz".format(bottom, top)
    plt.title(title)
    plt.xlabel("Frequency")
    ax1.set_ylabel('Mean Responce Time (ms)', color='r')
    ax2.set_ylabel('Standard Deviation of Sample (ms)', color='b')


    ax1.legend(loc='upper right')
   #ax2.legend(loc='upper right')

    plt.show()


def timeAnalysis(loops, pause_time, server_name, server_port, complexity='0'):

    Pulses = {}

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print("UDP client running...")
    print("Connecting to server at IP: ", server_name, " PORT: ", server_port)


    for i in range (loops):

        #create the initial pulse with time stamp
        newEntry = {"Start Time": dt.now().strftime("%M:%S:%f")} 

        #create the message to the server, the current time is stored, all we need from it
        #is the time it recieves the message
        msg = str(1/pause_time)

        client_socket.sendto(msg.encode(),(server_name, server_port))

        #return values from the server
        msg, sadd = client_socket.recvfrom(2048)
        newEntry["Return Time"] = dt.now().strftime("%M:%S:%f")

        processing = msg.decode().split("#")
        #show output and wait for a small time to space apart the pulses
        newEntry["Recieved Time"] = processing[0]
        newEntry["Sending Time"] = processing[1]
 

        Pulses[i] = newEntry

        t.sleep(pause_time)

    client_socket.close()
    return Pulses

def timeAnalysisTCP(loops, pause_time, server_name, server_port, complexity='0'):

    Pulses = {}

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("UDP client running...")
    print("Connecting to server at IP: ", server_name, " PORT: ", server_port)

    
    client_socket.connect((server_name, server_port))
    for i in range (loops):

        #create the initial pulse with time stamp
        newEntry = {"Start Time": dt.now().strftime("%M:%S:%f")} 

        #create the message to the server, the current time is stored, all we need from it
        #is the time it recieves the message
        msg = str(1/pause_time)
        client_socket.send(msg.encode())

        #return values from the server
        msg = client_socket.recv(1024)
        newEntry["Return Time"] = dt.now().strftime("%M:%S:%f")

        processing = msg.decode().split("#")
        #show output and wait for a small time to space apart the pulses
        newEntry["Recieved Time"] = processing[0]
        newEntry["Sending Time"] = processing[1]
 

        Pulses[i] = newEntry

        t.sleep(pause_time)

    client_socket.close()
    return Pulses



#data = processData(timeAnalysis(loops, pause_time, server_name, server_port))
#print(data)

#want to print this as a bunch of impulses of amplitude 1



#plotPulses(data)
#toPlot = "Client-Server Time"
#print(data[toPlot])
#plotNormal(data[toPlot], 20, toPlot)

toPlot = "Round Trip Time"
minFreq = 100
highFreq = 2000
steps = 50
samples = 15
server_name = "146.169.236.175"
server_port = 13000

#criteria, bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000
frequencySweepTCP(toPlot, minFreq, highFreq, steps, samples, server_name, server_port)
print("stopped")
