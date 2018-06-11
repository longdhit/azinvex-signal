//+------------------------------------------------------------------+
//|                                                        AZBot.mq4 |
//|                        Copyright 2018, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2018, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
#define READURL_BUFFER_SIZE   1000
#import "wininet.dll"
int InternetOpenW(string,int,string,string,int);
int InternetOpenUrlW(int,string,string,int,int,int);
int InternetCloseHandle(int);
int InternetReadFile(int,uchar  &arr[],int,int  &arr[]);
#define INTERNET_FLAG_PRAGMA_NOCACHE    0x00000100
#define INTERNET_FLAG_NO_CACHE_WRITE    0x04000000
#define INTERNET_FLAG_RELOAD            0x80000000
#import
input string server="http://signal.azinvex.com";
input string token="";
input string expert="";
input double lot=0.1;

bool flag=true;
string lastest_key="";
string lastest_type="";
string newest_key="";
string newest_type="";
string components[];
string receive;
ulong ticket;
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//---
   if(Server()!=-1)
     {
      SHOWTEXT("server","SERVER: Online",15,40,9,Yellow,1);
         receive=Get();
         if(receive!=IntegerToString(200))
           {
            newest_key=components[1];
            newest_type=components[0];
            lastest_key=components[1];
            lastest_type=components[0];
           }
         flag=true;
        }
     }
   else
     {
      SHOWTEXT("server","SERVER: Offline",15,40,9,Yellow,1);
     }
   SHOWTEXT("title","You are using Free Version (Contact azinvex.com to upgrade) ",15,15,9,Yellow,1);
   SHOWTEXT("dash","______________________________",15,15,9,Yellow,0);
   SHOWTEXT("logo","AZINVEX.COM Professional Forex Auto Bot",15,40,9,Yellow,0);
   SHOWTEXT("dash2","- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",15,40+25,9,Yellow,0);
   SHOWTEXT("info","|  Website: http://azinvex.com",15,65+25,9,Yellow,0);
   SHOWTEXT("info2","|  Email: azinvex@gmail.com",15,90+25,9,Yellow,0);
   SHOWTEXT("info3","|  Hotline: 096 690 7454",15,115+25,9,Yellow,0);

   EventSetTimer(1);
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---
   ObjectDelete("server");
   ObjectDelete("status");
   ObjectDelete("title");
   ObjectDelete("logo");
   ObjectDelete("dash");
   ObjectDelete("dash2");
   ObjectDelete("info");
   ObjectDelete("info2");
   ObjectDelete("info3");
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
//---
   if(Server()!=-1)
     {
      SHOWTEXT("server","SERVER: Online",15,40,9,Yellow,1);
     }
   else
     {
      SHOWTEXT("server","SERVER: Offline",15,40,9,Yellow,1);
     }

  }
//+------------------------------------------------------------------+
void OnTimer()
  {
   if(flag)
     {
      receive=Get();
      if(receive!=-1 && receive!=200)
        {
         ParseMessage(receive,components);
         newest_key=components[1];
         newest_type=components[0];
         if(components[0]=="MODIFY")
           {
            ticket=SelectOrder(components[1]);
            if(getSL(ticket)!=StringToDouble(components[2]) || getTP(ticket)!=StringToDouble(components[3]))
              {
               OrderModify(ticket,0,StringToDouble(components[2]),StringToDouble(components[3]),0);
              }
           }
            else if(newest_key!=lastest_key || newest_type!=lastest_type)
              {
               // do something
               lastest_key=components[1];
               lastest_type=components[0];
               if(components[0]=="OPEN")
                 {
                  string symbol=components[3]+getSuffix(Symbol());
                  if(components[2]==IntegerToString(0))
                    {

                        ticket=OrderSend(symbol,OP_BUY,lot,MarketInfo(symbol,MODE_ASK),3,StringToDouble(components[4]),StringToDouble(components[5]),components[1],0,0,clrNONE);
                      
                    }
                  if(components[2]==IntegerToString(1))
                    {
         
                        ticket=OrderSend(symbol,OP_SELL,lot,MarketInfo(symbol,MODE_BID),3,StringToDouble(components[4]),StringToDouble(components[5]),components[1],0,0,clrNONE);
                   

                    }
                 }
               if(components[0]=="CLOSE")
                 {
                  CloseOrder(SelectOrder(components[1]));
                 }
              }
        }
     }

  }
string ReadUrl(string Url,bool PrintDebuggingMessages=false)
  {
   string strData= "-1";
   bool bSuccess = false;

// Get an internet handle
   int hInternet=InternetOpenW("mt4",0 /* 0 = INTERNET_OPEN_TYPE_PRECONFIG */,NULL,NULL,0);
   if(hInternet==0)
     {
      if(PrintDebuggingMessages) Print("InternetOpenW() failed");

        } else {
      // Get a URL handle
      int hInternetUrl=InternetOpenUrlW(hInternet,Url,"",0,INTERNET_FLAG_NO_CACHE_WRITE|INTERNET_FLAG_PRAGMA_NOCACHE|INTERNET_FLAG_RELOAD,0);
      if(hInternetUrl==0)
        {
         if(PrintDebuggingMessages) Print("InternetOpenUrlW() failed");

           } else {
         if(PrintDebuggingMessages) Print("Okay: url handle: ",hInternetUrl);
         bool bKeepReading=true;
         while(bKeepReading)
           {
            int szRead[1];
            uchar arrReceive[];
            ArrayResize(arrReceive,READURL_BUFFER_SIZE+1);
            int success=InternetReadFile(hInternetUrl,arrReceive,READURL_BUFFER_SIZE,szRead);

            if(success==0)
              {
               if(PrintDebuggingMessages) Print("InternetReadFile() failed");
               bKeepReading=false;

                 } else {
               if(szRead[0]==0)
                 {
                  if(PrintDebuggingMessages) Print("Reached end of data");
                  bKeepReading=false;
                  bSuccess=true;

                    } else {
                  string strThisRead=CharArrayToString(arrReceive,0,szRead[0],CP_UTF8);
                  strData=strData+strThisRead;
                 }
              }
           }
         InternetCloseHandle(hInternetUrl);
        }
      InternetCloseHandle(hInternet);
     }

   return (strData);
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
int Server()
  {
   string headers;
   char post[],result[];
   return ReadUrl("http://signal.azinvex.com/ping");
  }
//+------------------------------------------------------------------+
string Get()
  {
   string msg,headers;
   char post[],result[];
   msg = ReadUrl("http://signal.azinvex.com/mt4");
   if(msg!=-1)
     {
      return msg;
     }
   return -1;
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
void SHOWTEXT(string name,string s,int x,int y,int size,double c,int corner)
  {
   ObjectCreate(name,OBJ_LABEL,0,Time[0],0);
   ObjectSet(name,OBJPROP_COLOR,c);
   ObjectSet(name,OBJPROP_CORNER,corner);
   ObjectSet(name,OBJPROP_XDISTANCE,x);
   ObjectSet(name,OBJPROP_YDISTANCE,y);
   ObjectSetString(0,name,OBJPROP_FONT,"Microsoft Sans Serif");
   ObjectSet(name,OBJPROP_FONTSIZE,size);
   ObjectSetText(name,s);
   ObjectSetInteger(0,name,OBJPROP_HIDDEN,true);

  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
void ParseMessage(string &message,string &retArray[])
  {
   string sep="|";
   ushort u_sep=StringGetCharacter(sep,0);
   int splits=StringSplit(message,u_sep,retArray);
  }
//+------------------------------------------------------------------+
double getSL(ulong tick)
  {
   if(OrderSelect(tick,SELECT_BY_TICKET)==true)
      return OrderStopLoss();
   else
      return 0;
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
double getTP(ulong tick)
  {
   if(OrderSelect(tick,SELECT_BY_TICKET)==true)
      return OrderTakeProfit();
   else
      return 0;
  }
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
ulong SelectOrder(string unique)
  {
   ulong tick=0;
   for(int pos=0;pos<OrdersTotal();pos++)
     {
      if(OrderSelect(pos,SELECT_BY_POS)==true)
         if(OrderComment()==unique)
           {
            tick=OrderTicket();
            return tick;
           }
     }
   return tick;
  }
string getSuffix(string symbol)
  {
   return StringSubstr(symbol,6);
  }  
void CloseOrder(ulong tick)
  {
   if(OrderSelect(tick,SELECT_BY_TICKET)==true)
     {
      int result;
      result=OrderClose(OrderTicket(),OrderLots(),OrderClosePrice(),1000);
     }
   else
      Print("OrderSelect returned the error of ",GetLastError());
  }  