function gebi(id) {
  return document.getElementById(id);
}
/*
var csel = gebi("econ");
var cs = new CoinStackBar({
    container:csel,
    coinimgsrc:'coin.svg',
    coinimgwidth:200,
    coinimgheight:100,
    coinheight:30,
    xoffset:10,
    yoffset:6,
    
    startvalue:25,
    maxstackheight:14,
    containerwidth:120,
});

function set_coins(val) {
    csel.CoinStackBar.setValue(val*12);
}
*/
var happinesses = {};
var metric;

function set_happiness(type, val) {
  if (type == "heating") {
    set_thermometer(6 - val);
    return;
  }
  val = (val/2 + 3) | 0;
  if (val < 1) val = 1;
  if (val > 5) val = 5;
  //console.log(`${type}=${val}`);
  if (happinesses[type] == val) return; // avoid spurious animation
  happinesses[type] = val;
  if (type == "cost") set_coins(val);
  //var n={environment:1,economy:2,wellbeing:3}[type];

    var n = { Environment: 1, Society: 2, Economy: 3, total: 4 }[type];
  if (n) {
    var el = gebi(`hap${n}`).firstChild;
    for (var i = 1; el; el = el.nextSibling, i++) {
      el.className = i == val ? "" : "transparent";
    }
  }
}

function set_metric(n) {
    metric = n;//metrics[n];
  console.log(`metric=${metric}`);
  for (var i = 0; i < metrics.length; i++)
    gebi(`blk${i + 1}`).classList[i == n ? "add" : "remove"]("highlight");
  set_lights();
}

var orb = [];

// function get_orb_colour(obj) {
//   var value = null;
//   //console.log(obj);
//   if (obj && metric && obj[metric] !== null) {
//     value = obj[metric];
//     if (!isFinite(value)) value = null;
//     else {
//       value = 2 * (value - 1); // map from 1-5 to 0-8
//       //value += 4; // map from -5-5 to 0-8
//       if (value < 0) value = 0;
//       if (value > 8) value = 8;
//       value |= 0;
//     }
//   }
//   //value goes from 0-8
//   var orb_colours = [
//     //modified version to make the real life colours better (no blue, more full saturated r/g
//     0xe00000,
//     0xff4000,
//     0xff8000,
//     0xffc000,
//     0xffe700,
//     0xffff00,
//     0xc2ff00,
//     0x79ff00,
//     0x00ff00

// /*    0xff0000,
//     0xff3d00,
//     0xff5f00,
//     0xffa000,
//     0xffd700,
//     0xffff00,
//     0xc2ff00,
//     0x79ff00,
//     0x00ff00
// */
//   ];
//   //console.log(`orb ${value}`);
//   var rgb = value === null ? 0x000000 : orb_colours[value];
//   return rgb;
// }

const anim = {
  NONE: 0,
  FLASH_SLOW: 1,
  FLASH_FAST: 2,
  CRAWL_SLOW_LEFT: 3,
  CRAWL_SLOW_RIGHT: 4,
  CRAWL_FAST_LEFT: 5,
  CRAWL_FAST_RIGHT: 6,
  DISCO: 7
};
var ledmap = [
    11,8,9,10,7,12,13,
    1,3,5,0,6,2,4,
    21,26,25,27,24,22,23,
    16,20,15,14,17,18,19
];

function set_lights() {
  var a = new Uint8Array(28 * 13);
  for (var i = 0, ptr = 0; i < 28; i++) {
    function setrgb(rgb) {
      a[ptr++] = (rgb >> 16) & 0xff;
      a[ptr++] = (rgb >> 8) & 0xff;
      a[ptr++] = rgb & 0xff;
    }
      // main colour
      //console.log(`start ${i}`);
      var o=orb[ledmap[i]];
      if (o) {
	  //console.log(metric);
	  //console.log(get_orb_colour(score_tiles([orb[ledmap[i]]])));
	  setrgb(get_orb_colour(score_tiles([orb[ledmap[i]]])));
      } else {
	  setrgb(0);
      }
      //console.log(`end ${i}`);
    //setrgb(get_orb_colour(score_tiles(orb[ledmap[i]])));
    // flash colour (unused if no animation)
    setrgb(0xffffff); // white
    // corner colour
    setrgb(0); // unused
    // corner pressed colour
    setrgb(0); // unused
    // animation type
    a[ptr++] = anim.NONE;
  }
  if (!passive && lights) lights.send(a);
}

function ids_to_tiles(c) {
    var tile = [];
    var problems = [];
    for (var n = 0; n < c.length; n++) {
	var i = c[n];
	if (!i || i === "00000000" || i === "eeeeeeee") continue;
	var obj = blocks[i];
	tile[n] = obj;
	if (!obj) {
	    problems.push(`dunno what ${i} is`);
	    continue;
	}
    }
    return [ tile, problems ];
}

function set_blocks(c) {
    var ret = ids_to_tiles(c);
    console.log(c);
    console.log(ret);
    var tiles = ret[0];
    var problems = ret[1];

    var mt = score_tiles(tiles);
    orb = tiles;
    console.log(mt);
    for (let m of metrics) {
	var val = mt[m] || 0;
	set_happiness(m, val);
	console.log(`val_${m}`);
	var el=gebi(`val_${m}`);
	if (el) {
	    el.innerHTML= format_score(val);
	} 
    }
    //gebi(`val_${m}`).innerHTML= format_score(mt[null]);
    
    gebi(`val_total`).innerHTML=format_score(mt.total);
    set_happiness("total", mt.total);    
    //  gebi("blk8").innerHTML = str;
    set_lights();
  //console.log(mc);
    gebi("problems").style.display =
	problems.length && !still_loading ? "block" : "none";
    if (problems.length) {
	var prefix = "<big>⚠</big>";
	gebi("problems").innerHTML = prefix + problems.join("<br>" + prefix);
	return;
    }
}

function init_headings() {
    for (var i=0; i<3; i++) {
	gebi(`blk${i+1}`).getElementsByTagName("h1")[0].innerHTML=game.metrics[i];
	gebi(`blk${i+1}`).getElementsByTagName("h1")[0].innerHTML=game.metrics[i];
    }
}
function set_thermometer(m) {
  console.log(`set_thermometer ${m}`);
  $("#thermometer").thermometer("setValue", m);
}

var debug = false;
function keyevent(e) {
  switch (e.key) {
    case "d":
      debug = !debug;
      console.log(`debug ${debug}`);
      gebi("d1").style.display = debug ? "block" : "none";
      break;
    case "1":
    case "2":
    case "3":
    //case "4":
    //case "5":
      console.log(e.key);
      set_metric(parseInt(e.key) - 1);
      break;
  }
}
var passive = false;
var qq = 0;
var testing = false;
$(document).ready(function() {
  // setInterval(function() {
  // 	qq=((qq+1)%28);
  //     set_lights();
  // }, 500);
  if (testing) {
    set_blocks(["95af4c63", "476f4c63"]);
    window.onkeypress = keyevent;
    //setInterval(function() {
    //     var coins = (10+Math.random()*80)|0;
    //     set_coins(coins);
    //     //gebi("blk0").innerHTML=`${coins}`;
    //     set_happiness(1,1+(Math.random()*3)|0);
    //     set_happiness(2,1+(Math.random()*3)|0);
    //     set_happiness(3,1+(Math.random()*3)|0);
    //     set_thermometer((Math.random()*5000)|0);
    //set_metric(((Math.random()*5)|0));
    //}, 2000);
  } else {
    comms_init();
    window.onkeypress = keyevent;
    set_metric(0);
    for (var i = 0; i < metrics.length; i++)
      gebi(`blk${i + 1}`).addEventListener(
        "click",
        (i => () => set_metric(i))(i),
        false
      );
      init_headings();
    if (window.location.hash.match(/passive/)) {
      passive = true;
      gebi("loading2").firstChild.textContent += "(passive)";
    }
  }
});