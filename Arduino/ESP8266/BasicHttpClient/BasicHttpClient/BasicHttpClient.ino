/**
 * BasicHTTPClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ESP8266HTTPClient.h>

#define USE_SERIAL Serial
//#include <String>

ESP8266WiFiMulti WiFiMulti;


const char* ssid = "VM6035777";
const char* password = "7twtrxBPdndn";

void setup() {

    USE_SERIAL.begin(115200);
   // USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

//    for(uint8_t t = 4; t > 0; t--) {
//        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
//        USE_SERIAL.flush();
//        delay(1000);
//    }

    WiFiMulti.addAP(ssid, password);

}

void loop() {
    // wait for WiFi connection
    if((WiFiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;
        String payload;
        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        //http.begin("https://192.168.1.12/test.html", "7a 9c f4 db 40 d3 62 5a 6e 21 bc 5c cc 66 c8 3e a1 45 59 38"); //HTTPS
        http.begin("http://192.168.0.89/Data"); //HTTP

        USE_SERIAL.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                payload = http.getString();
                USE_SERIAL.println(payload);
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        for (int i=0;i<numpieces(payload, '\n');i++){
           String temp=split(payload,'\n',i);
           char tempch[200];
           temp.toCharArray(tempch,200);
           USE_SERIAL.printf(tempch);
           
          
          }

        http.end();
    }

    delay(10000);
}

int numpieces(String data, char separator){

    int maxIndex = data.length() - 1;
    int found = 0;
    for (int i = 0; i <= maxIndex; i++) {
            if (data.charAt(i) == separator || i == maxIndex) {
                found++;
            }
        }
  
  }


String split(String data, char separator, int index)
{
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;

    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
