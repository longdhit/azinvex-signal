//+------------------------------------------------------------------+
//|                                                   MT5-Server.mq4 |
//|                        Copyright 2018, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2018, AZInvex Group."
#property link      "https://www.azinvex.com"
#property description    "Dang Hai Long"
#property version   "1.00"
#property strict
#include <Zmq/Zmq.mqh>
#include <Trade/Trade.mqh>

input string PROJECT_NAME="MT4 Socket Server";
input string ZEROMQ_PROTOCOL="tcp";
input string HOSTNAME="*";
input int REP_PORT=6666;
input int MILLISECOND_TIMER=1;  // 1 millisecond
input double LotSize=0.1;
input long order_magic=6666; 
// CREATE ZeroMQ Context
Context context("MT5 Socket Server");
// CREATE ZMQ_REP SOCKET
Socket repSocket(context,ZMQ_REP);

CTrade *azinvex = new CTrade;

// VARIABLES FOR LATER
uchar data[];
ZmqMsg request;
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+

int OnInit()
  {
//---
   EventSetMillisecondTimer(MILLISECOND_TIMER);
   Print("[REP] Binding MT5 Server to Socket on Port "+IntegerToString(REP_PORT)+"..");    
   repSocket.bind(StringFormat("%s://%s:%d", ZEROMQ_PROTOCOL, HOSTNAME, REP_PORT));
   repSocket.setLinger(1000);
   repSocket.setSendHighWaterMark(5);

//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---
   Print("[REP] Unbinding MT5 Server from Socket on Port "+IntegerToString(REP_PORT)+"..");
   repSocket.unbind(StringFormat("%s://%s:%d",ZEROMQ_PROTOCOL,HOSTNAME,REP_PORT));

  }
//+------------------------------------------------------------------+
//| Expert timer function                                            |
//+------------------------------------------------------------------+
void OnTimer()
  {
//---
   repSocket.recv(request,true);
   ZmqMsg reply=MessageHandler(request);
   repSocket.send(reply);

  }
//+------------------------------------------------------------------+

ZmqMsg MessageHandler(ZmqMsg &request)
  {
   ZmqMsg reply;
   string components[];

   if(request.size()>0)
     {

      ArrayResize(data,request.size());
      request.getData(data);
      string dataStr=CharArrayToString(data);

      ParseZmqMessage(dataStr,components);
      ZmqMsg ret(getReply(components));

      reply=ret;

     }
   else
     {
      // NO DATA RECEIVED
     }

   return(reply);
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
string getReply(string &compArray[])
  {
 
   int switch_action=0;
   if(compArray[0]=="TRADE" && compArray[1]=="OPEN" && ArraySize(compArray) >= 7)
      switch_action= 1;
   if(compArray[0] == "TRADE" && compArray[1] == "CLOSE" && ArraySize(compArray) >= 3)
      switch_action= 2;
   if(compArray[0] == "MODIFY" && ArraySize(compArray) >= 3)
      switch_action= 3;           
   string ret = IntegerToString(-1);
   int ticket = -1;
   double price_array[];
   ArraySetAsSeries(price_array,true);
   uint res;
   int price_count=0;
   double close_price;
   double open_price;
   string action;
   string special;
   switch(switch_action)
     {
      case 1:
         special = compArray[7];
         if(compArray[2]==0){
            open_price = SymbolInfoDouble(compArray[3],SYMBOL_ASK);
            azinvex.PositionOpen(compArray[3],ORDER_TYPE_BUY,0.1,open_price,compArray[5],compArray[6],"AZInvex");
         }
         else{
            open_price = SymbolInfoDouble(compArray[3],SYMBOL_BID);
            azinvex.PositionOpen(compArray[3],ORDER_TYPE_SELL,0.1,open_price,compArray[5],compArray[6],"AZInvex");
         }
         if(azinvex.ResultRetcode() == 10009)
           {
          
             ret="S|"+azinvex.ResultOrder()+"|"+open_price+"|"+special;
           }
         else
           {
            ret = "ERROR|"+GetLastError()+"|"+special;
           }  
         return ret;
         break;
      case 2:
         azinvex.PositionClose(StringToInteger(compArray[2]));
         if(azinvex.ResultRetcode() == 10009){
             close_price = azinvex.ResultPrice();
             ret=StringFormat("CLOSE|%f|%s",close_price,compArray[2]);
         }
         return ret;
         break;
      case 3:
       
         azinvex.PositionModify(StringToInteger(compArray[3]),StringToDouble(compArray[1]),StringToDouble(compArray[2]));
         if(azinvex.ResultRetcode() == 10009){
             close_price = azinvex.ResultPrice();
             ret= StringFormat("UPDATED|%s",compArray[3]);
         }
         else
           {
            ret = "ERROR|"+GetLastError()+"|"+compArray[3];
           }  
         return ret;
         break;                
      default:
         return ret;
         break;
     }
   return ret;
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
void ParseZmqMessage(string &message,string &retArray[])
  {

   Print("Parsing: "+message);

   string sep="|";
   ushort u_sep=StringGetCharacter(sep,0);

   int splits=StringSplit(message,u_sep,retArray);

   for(int i=0; i<splits; i++)
     {
      Print(IntegerToString(i)+") "+retArray[i]);
     }
  }

void SendOrderToNodejs(string symbol, int ticket){
   double bid = SymbolInfoDouble(symbol,SYMBOL_BID);
   double ask = SymbolInfoDouble(symbol,SYMBOL_ASK); 
  string token = "Ln45CD872e#@$@DCAAS@#43";
  string cookie=NULL,headers; 
   char post[],result[]; 
   int res; 
  
   string google_url="http://localhost/signal/close/"+ticket+"/"+token+"/"+ask+"/"+bid; 
    Print(google_url);
//--- Reset the last error code 
   ResetLastError(); 
//--- Loading a html page from Google Finance 
   int timeout=1000; //--- Timeout below 1000 (1 sec.) is not enough for slow Internet connection 
   res=WebRequest("GET",google_url,cookie,NULL,timeout,post,0,result,headers); 
//--- Checking errors 
}
int SendOrderLocal(string symbol, ulong ticket)
  {
   double bid = SymbolInfoDouble(symbol,SYMBOL_BID);
   double ask = SymbolInfoDouble(symbol,SYMBOL_ASK); 
   string token = "Ln45CD872e#@$@DCAAS@#43";
   string str="ticket="+ticket+"&ask="+ask+"&bid="+bid+"&token="+token;
   string cookie=NULL;
   char data[],result[];
   ArrayResize(data,StringToCharArray(str,data,0,WHOLE_ARRAY,CP_UTF8)-1);
   int res;
   string google_url="http://localhost/api/signal/close";
   ResetLastError();
   int timeout=5000; //--- Timeout below 1000 (1 sec.) is not enough for slow Internet connection
   res=WebRequest("POST",google_url,NULL,0,data,data,str);
   return res;
  }
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
  {
  if(azinvex.ResultRetcode() == 10009){
     if(trans.type==3)
     {
      ulong postition = trans.position;
      SendOrderLocal(trans.symbol,postition);
     }
   }
  }