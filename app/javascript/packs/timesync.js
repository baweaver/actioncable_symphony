// import Clock from 'timesync/clock';

// $(function () {
//   let syncTag = $('#current-time');

//   const clock = new Clock({
//     onChange: offset => {
//       console.log(`changed offset: ${offset} ms`);
//     }
//   });

//   const colors = [
//     'red',
//     'orange',
//     'gold',
//     'green',
//     'indigo',
//     'violet'
//   ];

//   const getColor = n => colors[n % colors.length];

//   // get synchronized time
//   setInterval(() => {
//     const now = clock.now();

//     console.log(`now: ${now.toISOString()} ms`);

//     syncTag
//       .text(now)
//       .css({
//         'color': getColor(now),
//         // 'background': getColor(now % 1000),
//         'border-bottom': `5px solid ${getColor(now % 1000)}`
//       });
//   }, 1000);
// });
