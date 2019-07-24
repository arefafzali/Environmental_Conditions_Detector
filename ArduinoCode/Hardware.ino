#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include "ThingSpeak.h"
int i=0;
int counter=0;
int loop_counter=0;

int val;
float cel;
long duration;
int distance;
float sensor_volt;
float RS_air; //  Get the value of RS via in a clear air
float R0;  // Get the value of R0 via in H2
float sensorValue;

const char* ssid = "behzad";
//const char* password = "13781999";

int status = WL_IDLE_STATUS;
WiFiClient client;
ESP8266WebServer server(80);

const int led = 13;
const int red_led = 16;
const int trigPin = 5;
const int echoPin = 4;

unsigned long channel_number = 656148;
unsigned channel_field_temp = 1;
unsigned channel_field_dist = 2;
unsigned channel_field_gass = 3;
unsigned channel_field_view = 4;
const char channel_write_APIKey[] = "K971XFS6VN27OBCN";

// -----------------------------------------------------------

void handleRoot() {
  digitalWrite(led, 1);
  server.send(200, "text/plain", "server is on now!");
  digitalWrite(led, 0);
}

// -----------------------------------------------------------

void handleNotFound(){
  digitalWrite(led, 1);
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

// ------------------------------------------------------------

void setup(void){
  pinMode(led, OUTPUT);
  pinMode(red_led,OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  WiFi.begin(ssid); //password
  ThingSpeak.begin(client);
  digitalWrite(led, 0);
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  Serial.println("");
  

// -------------------------------------------------------------

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

// ------------------------------------------------------------

  server.on("/", handleRoot);
  
// ------------------------------------------------------------
  server.on("/informations", [] () {
    server.send(200, "text/plain", "Temprature: "+String(cel)+"*c"+"\nDistance: "+String(distance)+" cm"+"\nCO2: "+String(R0*100)+"%");

    counter++;
    ThingSpeak.writeField(channel_number, channel_field_view, counter, channel_write_APIKey);
  });

// ------------------------------------------------------------

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

// ------------------------------------------------------------

void temp_calculate(void) {
    val = analogRead(A0);

    float mv = (val/1024.0)*3300;
    cel= mv/10;
    
    ThingSpeak.writeField(channel_number, channel_field_temp, cel, channel_write_APIKey);
}

// -------------------------------------------------------------

void dist_calculate(void) {
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance= duration*0.034/2;

    ThingSpeak.writeField(channel_number, channel_field_dist, distance, channel_write_APIKey);
}

// -------------------------------------------------------------

void gass_calculate(void) {
  // Get a average data by testing 100 times
    for(int x = 0 ; x < 100 ; x++)
    {
        sensorValue = sensorValue + analogRead(A0);
    }
    sensorValue = sensorValue/100.0;

    sensor_volt = sensorValue/1024*5.0;
    RS_air = (5.0-sensor_volt)/sensor_volt; // omit * RL
    R0 = RS_air/9.8; // The ratio of RS/R0 is 9.8 in a clear air from Graph (Found using WebPlotDigitizer)

    ThingSpeak.writeField(channel_number, channel_field_gass, R0, channel_write_APIKey);
}

// -------------------------------------------------------------

void loop(void){
  server.handleClient();
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

// ---------------------------------
  if(loop_counter>=1800){
    digitalWrite(red_led,HIGH);
    delay(1000);
    temp_calculate();
    dist_calculate();
    gass_calculate();
    server.handleClient();
    delay(1000);
    digitalWrite(red_led,LOW);
  loop_counter = 0;
  }
// ---------------------------------
  delay(10);
  loop_counter++;
  
}
