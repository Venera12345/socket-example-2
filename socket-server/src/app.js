const app = require('express')();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let list = [];
let filter = [];
let total = 10;
let limit = 10;
let offset = 0;

const TOTAL = 100000;
const COLORE = ['green', 'red', 'purple', 'blue', 'grey', 'pink', 'yellow', 'orange', 'beige', 'black', 'white'];

for (let index = 0; index < TOTAL; index++) {
  list.push({
        id: Math.round(Math.random()*1000) + '',
        int: Math.round(Math.random()*1000),
        float: Math.random(),
        color: COLORE[Math.round(Math.random()*10)],
        child: {
          id: Math.round(Math.random()*1000) + '',
          color: COLORE[Math.round(Math.random()*10)],
        },
    });
}

  io.on("connection", socket => {
    const valueList = [...new Set(filter.length ? list?.filter((item)=>filter?.some((a)=>a === item.id)): list)];

    socket.on("setTotal", totalValue => {
      total = totalValue;
      offset = 0;
      const valueList = [...new Set(filter.length ? list?.filter((item)=>filter?.some((a)=>a === item.id)): list)];
      const newValueList = total && total < valueList?.length ? [...new Set(valueList.slice(0, total))]: [...new Set(valueList)];      
      let subarray = [];
      for (let i = 0; i <Math.ceil(newValueList.length/limit); i++){
          subarray[i] = newValueList.slice((i*limit), (i*limit) + limit);
      }   
      socket.emit('listItems', subarray[offset]);
      });

    socket.on("setFilter", filterValue => {
      filter = filterValue;
      offset = 0;
      const valueList = [...new Set(filter.length ? list?.filter((item)=>filter?.some((a)=>a === item.id)): list)];
      const newValueList = total && total < valueList?.length ? [...new Set(valueList.slice(0, total))]: [...new Set(valueList)];      
      let subarray = [];
      for (let i = 0; i <Math.ceil(newValueList.length/limit); i++){
          subarray[i] = newValueList.slice((i*limit), (i*limit) + limit);
      }     
      socket.emit('listItems', subarray[offset]);
    });

    socket.on("setScroll", scrollrValue => {
      offset = scrollrValue;
      const valueList = [...new Set(filter.length ? list?.filter((item)=>filter?.some((a)=>a === item.id)): list)];
      const newValueList = total && total <= valueList?.length ? [...new Set(valueList.slice(0, total))]: [...new Set(valueList)]; 
      let subarray = [];
      for (let i = 0; i <Math.ceil(newValueList.length/limit); i++){
            subarray[i] = newValueList.slice((i*limit), (i*limit) + limit);
      }        
      socket.emit('listItems', subarray[offset])
    });

    socket.on('disconnect', () => {
      filter = [];
      total = 10;
      limit = 10;
      offset = 0;
      socket.emit('disconnected');

    });

    socket.emit('listItems', valueList.slice(0,10))
    console.log(`Socket ${socket.id}`);
  });
  http.listen(4444, (e) => {
    console.log('Listening on port 4444');
  });
