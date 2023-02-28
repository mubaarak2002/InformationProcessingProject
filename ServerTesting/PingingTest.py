from datetime import datetime as dt
import time as t
from scipy.stats import norm
import matplotlib.pyplot as plt
import numpy as np
import socket
import statistics as stats
from matplotlib.widgets import Slider, Button
import json

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

def frequencySweepUDP(criteria="Round Trip Time", bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000, plot=1):


    #this function takes a parameter and sweeps accross a certain refresh rate
    #f = 1/t, thus every 0.1s = 10 Hz.
    #numSamples determines how many increments to take
    #The output is the mean responce time per frequency
    increment = (top-bottom)/steps
    frequencies = []
    means = []
    stds = []

    dout = {}
    datas = {}

    for i in range(steps):
        frequency = bottom + increment * i
        print(frequency)
        frequencies.append(frequency)
        data = processData(timeAnalysisUDP(numSamples, (1/frequency), server_name, server_port))


        datas[i] = {"frequency": frequency, "data": data}
        
        
        if (criteria != "all"):
            mu, std = norm.fit(data[criteria])
        else:
            mu, std = norm.fit(data["Round Trip Time"])

        means.append(mu)
        stds.append(std)

    #this indicates you just want the data, and dont want it to plot it for you
    dout["Frequency Raw Data"] = datas
    dout["Frequency Responce"] = {"Frequency": frequencies, "means": means, "stds": stds}
    if(criteria == "all" and plot == 0):
        return dout


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

    if (plot == 1):
        plt.show()
    return {"plt": plt, "data": data}

def frequencySweepTCP(criteria="Round Trip Time", bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000, plot=1):


    #this function takes a parameter and sweeps accross a certain refresh rate
    #f = 1/t, thus every 0.1s = 10 Hz.
    #numSamples determines how many increments to take
    #The output is the mean responce time per frequency
    increment = (top-bottom)/steps
    frequencies = []
    means = []
    stds = []
    dout = {}
    datas = {}

    
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("TCP client running...")
    print("Connecting to server at IP: ", server_name, " PORT: ", server_port)

    
    client_socket.connect((server_name, server_port))

    for i in range(steps):
        frequency = bottom + increment * i
        print(frequency)
        frequencies.append(frequency)
        data = processData(timeAnalysisTCP(numSamples, (1/frequency), server_name, server_port, client_socket))

        datas[i] = {"frequency": frequency, "data": data}
        
        if (criteria != "all"):
            mu, std = norm.fit(data[criteria])
        else:
            mu, std = norm.fit(data["Round Trip Time"])

        means.append(mu)
        stds.append(std)
    
    client_socket.close()
    #this indicates you just want the data, and dont want it to plot it for you
    dout["Frequency Raw Data"] = datas 
    dout["frequency Responce"] = {"Frequency": frequencies, "means": means, "stds": stds}
    if(criteria == "all" and plot == 0):
        return dout

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
    if (plot == 1):
        plt.show()
    return {"plt": plt, "data": data}
    
def timeAnalysisUDP(loops, pause_time, server_name, server_port, complexity='0'):

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

def timeAnalysisTCP(loops, pause_time, server_name, server_port, client_socket, complexity='0'):

    Pulses = {}

    for i in range (loops):

        #create the initial pulse with time stamp
        newEntry = {"Start Time": dt.now().strftime("%M:%S:%f")} 

        #create the message to the server, the current time is stored, all we need from it
        #is the time it recieves the message
        msg = str(1/pause_time) + " i = " + str(i)
        client_socket.send(msg.encode())
        print("sent message" + " i = " + str(i))

        #return values from the server
        msg = client_socket.recv(1024)
        newEntry["Return Time"] = dt.now().strftime("%M:%S:%f")
        print("Message Recieved")

        processing = msg.decode().split("#")
        #show output and wait for a small time to space apart the pulses
        newEntry["Recieved Time"] = processing[0]
        newEntry["Sending Time"] = processing[1]
 

        Pulses[i] = newEntry

        t.sleep(pause_time)

    
    return Pulses

def PlotData(x, y, chartTitle, xTitle, yTitle, colour='r'):
    fig, ax = plt.subplots()

    ax.plot(x, y)
    ax.set(
        xlabel = xTitle,
        ylabel = yTitle,
        color = colour,
        title = chartTitle
    )

def graph2Sided(x, y1, y2, chartTitle, xTitle, y1Title, y2Title, y1colour='r', y2colour='b'):

    fig, ax1 = plt.subplots()
    ax2 = ax1.twinx()

    ax1.plot(x, y1, y1colour, label = y1Title)
    ax2.plot(x, y2, y2colour, label = y2Title)

    plt.title(chartTitle)
    plt.xlabel(xTitle)
    ax1.set_ylabel(y1Title, color=y1colour)
    ax2.set_ylabel(y2Title, color=y2colour)


    ax1.legend(loc='upper right')

def graph2OnOne(x, y1, y2, chartTitle, xTitle, y1Title, y2Title, y1colour='r', y2colour='b'):

    fig, ax = plt.subplots()

    ax.plot(x, y1, y1colour, label = y1Title)
    ax.plot(x, y2, y2colour, label = y2Title)

    plt.title(chartTitle)
    plt.xlabel(xTitle)


    ax.legend(loc='upper right')
    
def normalSliders(x, y1, y2, chartTitle, xTitle, y1Title, y2Title, y1colour='r', y2colour='b'):
    #y1 and y2 need to be in the form {frequency: [samples]}, in order for the mean to be calculated
    
   
    mu1, std1 = norm.fit(y1[x[0]])
    mu2, std2 = norm.fit(y2[x[0]])
    print(plt.xlim())
    xSpace = np.linspace(0, 100, 100)
    p = norm.pdf(xSpace, mu1, std1)
    q = norm.pdf(xSpace, mu2, std2)

    fig, ax = plt.subplots()
    fig.subplots_adjust(bottom=0.25)
    l1, = ax.plot(xSpace, p, lw=2)
    l2, = ax.plot(xSpace, q, lw=2)

    ax_freq = fig.add_axes([0.25, 0.1, 0.65, 0.03])

    # define the values to use for snapping
    allowed_amplitudes = x

    sfreq = Slider(
    ax_freq, "Frequency", x[0], x[len(x)-1],
    valinit=x[1], valstep=(x[1]-x[0]),
    initcolor='none'  # Remove the line marking the valinit position.
    )

    def update(val):
        freq = sfreq.val

        mu1, std1 = norm.fit(y1[freq])
        mu2, std2 = norm.fit(y2[freq])
        #xmin, xmax = plt.xlim()
        xSpace = np.linspace(0, 100, 100)
        l1.set_ydata(norm.pdf(xSpace, mu1, std1))
        l2.set_ydata(norm.pdf(xSpace, mu2, std2))
        fig.canvas.draw_idle()

    sfreq.on_changed(update)
    


def FullAnalysis(lowerRange=100, topRange=1000, steps=10, numSamples=15, server_UDP_name='localhost', server_TCP_name='localhost',server_port_TCP=12000, server_port_UDP=12000, write=1, file_Name="data.txt"):
    #this function plots a full suite of tests and graphs comparing UDP and TCP, as well as other things.
    #all data from the analysis is saved in a file
    full_data = {}
    #this dictionary stores information about the sample that is done
    full_data["Criteria"] = {"Lower Range": lowerRange, "Top Range": topRange, "Steps": steps, "numSamples": numSamples, "Connection Status (TCP)": ("local" if server_TCP_name=="localhost" else "online"), "Connection Status (UDP)": ("local" if server_UDP_name=="localhost" else "online")}

    TCP_data = frequencySweepTCP("all", lowerRange, topRange, steps, numSamples, server_TCP_name, server_port_TCP, plot=0)
    UDP_data = frequencySweepUDP("all", lowerRange, topRange, steps, numSamples, server_UDP_name, server_port_UDP, plot=0)

    #processing main frequency responce data:


    #plot the mean UDP return time with Standard Deviation:

    graph2Sided(TCP_data["Frequency Responce"]["Frequency"], TCP_data["Frequency Responce"]["means"], TCP_data["Frequency Responce"]["stds"], "Round Trip Time of a TCP Connection", "Frequency", "Mean (ms)", "Standard Deviation (ms)")

    #plot the mean TCP return time with Standard Deviation:
    graph2Sided(UDP_data["Frequency Responce"]["Frequency"], UDP_data["Frequency Responce"]["means"], UDP_data["Frequency Responce"]["stds"], "Round Trip Time of a UDP Connection","Frequency", "Mean (ms)", "Standard Deviation (ms)")

    #plot the TCP vs UDP responce time versus frequency:
    graph2OnOne(TCP_data["Frequency Responce"]["Frequency"], UDP_data["Frequency Responce"]["means"], TCP_data["Frequency Responce"]["means"], "Round Trip time of a UDP and TCP Connection for Varying Frequencies", "Frequency", "UDP Mean (ms)", "TCP Mean (ms)")

    #plot the normal distributions of time based on frequencies that can be changed by the user.
    UDPVals = {}
    TCPVals = {}
    frequency = []
    
    for key in UDP_data["Frequency Raw Data"].keys():
        frequency.append(UDP_data["Frequency Raw Data"][key]['frequency'])
        for sample in UDP_data["Frequency Raw Data"][key]:
            
            #print(UDP_data["Frequency Raw Data"][key]["data"]["Round Trip Time"])
            UDPVals[UDP_data["Frequency Raw Data"][key]["frequency"]] = UDP_data["Frequency Raw Data"][key]["data"]["Round Trip Time"]
            TCPVals[TCP_data["Frequency Raw Data"][key]["frequency"]] = TCP_data["Frequency Raw Data"][key]["data"]["Round Trip Time"]


    #print(frequency)
    normalSliders(frequency, UDPVals, TCPVals, "Normal Distributions of UDP and TCP Round Trip Time for a Given Frequency", "Responce Time", "UDP Round Trip Time", "TCP Round Trip Time")
    
    

    #writing to file, not working atm
    if (write):
        thing = json.dumps({"UDP Data": UDP_data, "TCP Data": TCP_data})
        f = open(file_Name, "w")
        f.write(thing)
        f.close()
        
    #plotNormal(UDPVals[frequency[1]])
    plt.show()
    

#data = processData(timeAnalysis(loops, pause_time, server_name, server_port))
#print(data)

#want to print this as a bunch of impulses of amplitude 1



#plotPulses(data)
#toPlot = "Client-Server Time"
#print(data[toPlot])
#plotNormal(data[toPlot], 20, toPlot)

toPlot = "Round Trip Time"
minFreq = 100
highFreq = 4000
steps = 100
samples = 50
server_name = ''
server_port = 12000

#criteria, bottom=0.7, top=1000, steps=10, numSamples=80, server_name='localhost', server_port=12000
#frequencySweepTCP(toPlot, minFreq, highFreq, steps, samples, server_name, server_port)
FullAnalysis()
print("stopped")


