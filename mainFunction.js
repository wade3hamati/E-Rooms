const { count } = require('console');
const csv = require('csv-parser')
const fs = require('fs')

const filePath = '/Users/wadehhamati/Desktop/E-Rooms/DATA_SCHED.csv';

function readCsvFile() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });

     
  });

}

readCsvFile()
  .then((results) => {
    console.log("hello")
    // do something with results

    // const filteredArray = results.filter(obj => obj['Room Code'].startsWith('H'));

    // const printedRooms = new Set();
    // filteredArray.forEach(obj => {
    //   if (!printedRooms.has(obj['Room Code'])) {
    //     console.log(obj['Room Code']);
    //     printedRooms.add(obj['Room Code']);
    //   }
    // });


    //Hall Building
    let mondayTimes = [];
    let mondayTimes2 = [];

    function createMondayTimesArray() {
      let counter = 0;
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        const dateInput = "23/09/2023";
        const startDate = row["Start Date (DD/MM/YYYY)"];
        const endDate = row["End Date (DD/MM/YYYY)"];
        let dateFit = fallsBetween(dateInput, startDate, endDate);
        // if(dateFit){
        //    console.log (dateFit);
        // }
        

        //Look for rooms that are occupied on monday amd that start with "H".
        //add to this a check for dates for rooms like H861 and H1029. It is important.
        if (row["Mon"] === "Y" && row["Room Code"].startsWith("H") && (dateFit)) {
          // counter++;
          const roomCode = row["Room Code"];
          const startTime = row["Class Start Time"];
          const endTime = row["Class End Time"];
    
          // Find the index of the room code in the mondayTimes array
          const index = mondayTimes.findIndex(obj => obj.roomCode === roomCode);
    
          if (index === -1) {
            // If the room code isn't already in the array, add it with the start and end times
            mondayTimes.push({ roomCode: roomCode, startTimes: [startTime], endTimes: [endTime] });
          } else {
            // If the room code is already in the array, add the start and end times in ascending order
            const startTimes = mondayTimes[index].startTimes;
            const endTimes = mondayTimes[index].endTimes;
    
            // Find the index to insert the new start and end times in the arrays
            const insertIndex = findIndexToInsert(startTimes, startTime);
    
            startTimes.splice(insertIndex, 0, startTime);
            endTimes.splice(insertIndex, 0, endTime);
          }
        }

        // if (row["Mon"] === "Y" && row["Room Code"] === "H1029") {
        //   const roomCode = row["Room Code"];
        //   const startTime = row["Class Start Time"];
        //   const endTime = row["Class End Time"];
        //   console.log(roomCode + " " + startTime + " " + endTime)
        // }
      }

      for (let i = 0; i < mondayTimes.length; i++) {

        const row = mondayTimes[i];
        const column = mondayTimes2[i];
        const roomCode = row.roomCode;

        for (let j = 0; j < (row.startTimes.length - 1); j++) {
          let one = row.startTimes[j+1]
          let two = row.endTimes[j]
          const [h1, m1, s1] = one.split(".");
          const [h2, m2, s2] = two.split(".");

          const date1 = new Date(0, 0, 0, h1, m1, s1);
          const date2 = new Date(0, 0, 0, h2, m2, s2);

          const diffMs = date1.getTime() - date2.getTime();
          const diffTime = new Date(diffMs).toISOString().substr(11, 8);

          // Find the index of the room code in the mondayTimes array
          const index = mondayTimes2.findIndex(obj => obj.roomCode === roomCode);

          if (index === -1) {
            // If the room code isn't already in the array, add it with the start and end times
            mondayTimes2.push({ roomCode: roomCode, timeDifference: [diffTime] });
            counter++;
          } else {
            // If the room code is already in the array, add the diffTime in ascending order
            const timeDifference = mondayTimes2[index].timeDifference;
            timeDifference.splice(timeDifference.length, 0, diffTime);
          }
        }

        // if(column.roomCode == "H553"){
        //   console.log(column.timeDifference); 
        // }

      }
      console.log(mondayTimes2); // has time difference 
      // console.log(mondayTimes); // has start and end times
      mondayCheck = mondayTimes;
      console.log(counter) 
      buildTable(mondayTimes2);
      // return mondayTimes;
    }
    
    function findIndexToInsert(array, value) {
      let low = 0;
      let high = array.length;
    
      while (low < high) {
        const mid = (low + high) >>> 1;
    
        if (array[mid] < value) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
    
      return low;
    }

    function fallsBetween(dateInput, startDate, endDate){
      let operatorSD = startDate.split('/');
      let datepartSD = [];
      let datepartED = [];
      let datepartInput = [];
      // console.log(operatorSD);
      
      if(operatorSD.length > 1){
        datepartSD = startDate.split('/');
        datepartED = endDate.split('/');
        datepartInput = dateInput.split('/');
        // console.log(datepartSD);
        // console.log(datepartED);
        // console.log(datepartInput);
      }
      let daySD = parseInt(datepartSD[0]);
      let monthSD = parseInt(datepartSD[1]);
      // console.log(daySD + "/" + monthSD + "/" + yearSD);
      let dayED = parseInt(datepartED[0]);
      let monthED = parseInt(datepartED[1]);
      // console.log(dayED + "/" + monthED + "/" + yearED);
      let dayInput = parseInt(datepartInput[0]);
      let monthInput = parseInt(datepartInput[1]);
      // console.log(dayInput + "/" + monthInput + "/" + yearInput); 
      
      if((monthInput > monthSD) && (monthInput < monthED)){
        // console.log(monthSD + " " + monthInput + " " + monthED + " = good 1111111");
        return(true);
      }
      if(monthInput == monthSD){
        if(dayInput >= daySD){
          // console.log(monthSD + " " + monthInput + " " + monthED + " = good 222222");
          return(true);
        }
      }
      if(monthInput == monthED){
        if(dayInput <= dayED){
          // console.log(monthSD + " " + monthInput + " " + monthED + " = good 33333333");
          return(true);
        }
      }
      else{
        // console.log(monthSD + " " + monthInput + " " + monthED + " = bad");
        return(false);
      }
      
    }

    function buildTable(data){
      var table = document.getElementsByClassName('chartBox');
      console.log(table);
      let counter = 0;
      for(var i = 0; i < data.length; i++){
        console.log(data[i].timeDifference);
        counter++;
        // var row = `<tr>
        //               <td> ${data[i].roomCode} </td>
        //               <td> ${data[i].timeDifference} </td>
        //            </tr>`
        // table.innerHTML += row;
      }
      console.log(counter);

    }
    createMondayTimesArray(results);

    // //Monday
    // const filterMon = results.filter(room => room["Room Code"].startsWith("H") && room["Mon"] === "Y").map(room => room["Room Code"]);
    // const uniqueMon = new Set(filterMon);
    // console.log(uniqueMon);

    // //Tuesday
    // const filterTue = results.filter(room => room["Room Code"].startsWith("H") && room["Tues"] === "Y").map(room => room["Room Code"]);
    // const uniqueTue = new Set(filterTue);
    // console.log(uniqueTue);

    // //Wednesday
    // const filterWed = results.filter(room => room["Room Code"].startsWith("H") && room["Wed"] === "Y").map(room => room["Room Code"]);
    // const uniqueWed = new Set(filterWed);
    // console.log(uniqueWed);

    // //Thursday
    // const filterThu = results.filter(room => room["Room Code"].startsWith("H") && room["Thurs"] === "Y").map(room => room["Room Code"]);
    // const uniqueThu = new Set(filterThu);
    // console.log(uniqueThu);

    // //Friday
    // const filterFri = results.filter(room => room["Room Code"].startsWith("H") && room["Fri"] === "Y").map(room => room["Room Code"]);
    // const uniqueFri = new Set(filterFri);
    // console.log(uniqueFri);
         
  })
  .catch((err) => {
    console.error(err);
  });



// fs.createReadStream("/Users/wadehhamati/Downloads/DATA_SCHED.csv")
//   .pipe(csv({}))
//   .on('data', (data) => results.push(data))
//   .on('end', () => {
    
//   })

let weekDays = ['Monday', 'Tuseday','Wednesday', 'Thursday','Friday'];




