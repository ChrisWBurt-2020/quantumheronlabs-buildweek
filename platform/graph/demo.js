(function(){
  "use strict";

  var COLORS = { place:"#1f5c4d", landmark:"#c17a28", business:"#3a6ea5", nature:"#7a9a4d", culture:"#8a5ea8" };

  var NODES = [
    { id:"town", label:"Marrow Creek", short:"Marrow Creek", type:"place", typeLabel:"Place · Town", x:360, y:250, r:22,
      desc:"The fictional town at the centre of this sample graph. Every other node is a place, business, or landmark invented for Marrow Creek so the demo has something connected to explore.",
      source:"Fictional source: 'Marrow Creek Town Guide (Sample Edition)', p. 1 — invented for this demo." },
    { id:"library", label:"Marrow Creek Library", short:"Library", type:"culture", typeLabel:"Archive / Culture · Library", x:205, y:150, r:17,
      desc:"A fictional two-room library on the creek bend, famous in this invented story for its map wall and its winter reading nights.",
      source:"Fictional source: Library notice board, Marrow Creek — sample record LIB-01, invented for this demo." },
    { id:"ferry", label:"Old Ferry Landing", short:"Ferry Landing", type:"landmark", typeLabel:"Landmark · Transport", x:520, y:165, r:17,
      desc:"The old landing where the fictional ferry once crossed at low water. The timbers and ticket hut remain as a landmark in the sample data.",
      source:"Fictional source: 'Ferry Landing plaque (sample transcription)' — invented for this demo." },
    { id:"lighthouse", label:"Gull Rock Lighthouse", short:"Lighthouse", type:"landmark", typeLabel:"Landmark · Lighthouse", x:610, y:285, r:18,
      desc:"A fictional lighthouse on Gull Rock, guiding the night ferry in this invented harbour. Its light pattern is a favourite detail in the sample stories.",
      source:"Fictional source: Harbour log, Gull Rock — sample entry LH-07, invented for this demo." },
    { id:"bakery", label:"Harbor Bakery", short:"Bakery", type:"business", typeLabel:"Business · Bakery", x:445, y:95, r:15,
      desc:"A fictional bakery near the ferry landing, known in the demo for salt-bread loaves baked before the first boat.",
      source:"Fictional source: Bakery day book (sample) — invented for this demo." },
    { id:"tidemill", label:"Tidemill", short:"Tidemill", type:"business", typeLabel:"Business / Work · Mill", x:150, y:285, r:16,
      desc:"A fictional tidemill that grinds grain when the creek runs out to sea. It links the town's food, work, and water stories in the sample graph.",
      source:"Fictional source: Mill keeper's tally (sample) — invented for this demo." },
    { id:"market", label:"Creekside Market", short:"Market", type:"business", typeLabel:"Business · Market", x:360, y:375, r:16,
      desc:"The fictional Saturday market on the south bank, where the bakery, tidemill, and cafe in this demo all trade.",
      source:"Fictional source: Market stall list (sample), Saturday edition — invented for this demo." },
    { id:"cottage", label:"Ferryman's Cottage", short:"Ferryman's Cottage", type:"place", typeLabel:"Place · Cottage", x:545, y:70, r:14,
      desc:"A small fictional cottage above the landing, home in the sample stories to the ferryman who kept the crossing open through winter.",
      source:"Fictional source: Cottage deed summary (sample) — invented for this demo." },
    { id:"boardwalk", label:"Salt Marsh Boardwalk", short:"Boardwalk", type:"nature", typeLabel:"Nature · Boardwalk", x:110, y:400, r:16,
      desc:"A fictional raised boardwalk over the salt marsh, built in the demo so visitors can reach the osprey platform without disturbing the marsh.",
      source:"Fictional source: Boardwalk trail card (sample) — invented for this demo." },
    { id:"bell", label:"Bell Tower", short:"Bell Tower", type:"landmark", typeLabel:"Landmark · Tower", x:270, y:55, r:15,
      desc:"A fictional stone bell tower whose bell, in the sample data, marked ferry departures and market opening.",
      source:"Fictional source: Tower bell register (sample) — invented for this demo." },
    { id:"harbour-office", label:"Harbour Master's Office", short:"Harbour Office", type:"business", typeLabel:"Business / Work · Office", x:585, y:395, r:15,
      desc:"The fictional harbour office that keeps the tide table, ferry roster, and lighthouse log together — a neat example of sources linking nodes.",
      source:"Fictional source: Harbour office tide table (sample) — invented for this demo." },
    { id:"night-ferry", label:"Night Ferry", short:"Night Ferry", type:"place", typeLabel:"Place · Transport", x:640, y:190, r:14,
      desc:"The fictional evening ferry in the sample graph, running between the landing and Gull Rock when the lighthouse is lit.",
      source:"Fictional source: Night ferry timetable (sample) — invented for this demo." },
    { id:"archive", label:"Stone Archive", short:"Stone Archive", type:"culture", typeLabel:"Archive / Culture · Archive", x:215, y:235, r:15,
      desc:"A fictional stone archive beside the library, holding the invented maps, ferry logs, and mill tallies that act as sources for other nodes.",
      source:"Fictional source: Archive catalogue (sample), shelf A — invented for this demo." },
    { id:"osprey", label:"Osprey Nest Platform", short:"Osprey Platform", type:"nature", typeLabel:"Nature · Wildlife", x:70, y:315, r:14,
      desc:"A fictional viewing platform near a protected osprey nest at the marsh edge, connected in the demo to the boardwalk and the creek itself.",
      source:"Fictional source: Osprey watch notes (sample), spring — invented for this demo." },
    { id:"cafe", label:"Low Tide Café", short:"Low Tide Café", type:"business", typeLabel:"Business · Café", x:430, y:445, r:15,
      desc:"A fictional café by the market that, in the sample stories, only opens its creek-side door at low tide.",
      source:"Fictional source: Café menu card (sample) — invented for this demo." }
  ];

  var EDGES = [
    ["town","library"],["town","ferry"],["town","market"],["town","tidemill"],["town","bell"],
    ["library","archive"],["archive","tidemill"],["archive","ferry"],
    ["ferry","cottage"],["ferry","bakery"],["ferry","night-ferry"],["night-ferry","lighthouse"],
    ["lighthouse","harbour-office"],["harbour-office","market"],["harbour-office","night-ferry"],
    ["bakery","market"],["bakery","bell"],["tidemill","market"],["market","cafe"],
    ["boardwalk","osprey"],["boardwalk","tidemill"],["boardwalk","town"],["cafe","harbour-office"]
  ];

  var byId = {};
  NODES.forEach(function(n){ byId[n.id]=n; });

  var svgNS = "http://www.w3.org/2000/svg";
  var edgesG = document.getElementById("edges");
  var nodesG = document.getElementById("nodes");
  var viewport = document.getElementById("viewport");
  var detailType = document.getElementById("detail-type");
  var detailTitle = document.getElementById("detail-title");
  var detailBody = document.getElementById("detail-body");
  var detailConn = document.getElementById("detail-connections");
  var selectedId = null;
  var scale = 1;

  // Build edges
  var edgeEls = [];
  EDGES.forEach(function(pair){
    var a = byId[pair[0]], b = byId[pair[1]];
    var line = document.createElementNS(svgNS,"line");
    line.setAttribute("x1",a.x); line.setAttribute("y1",a.y);
    line.setAttribute("x2",b.x); line.setAttribute("y2",b.y);
    line.setAttribute("class","edge");
    line.dataset.a = pair[0]; line.dataset.b = pair[1];
    edgesG.appendChild(line);
    edgeEls.push(line);
  });

  function neighbours(id){
    var out = [];
    EDGES.forEach(function(p){
      if(p[0]===id) out.push(p[1]);
      if(p[1]===id) out.push(p[0]);
    });
    return out;
  }

  function highlight(id){
    edgeEls.forEach(function(el){
      var on = id && (el.dataset.a===id || el.dataset.b===id);
      el.classList.toggle("highlight", !!on);
      el.classList.toggle("dim", !!id && !on);
    });
    Array.prototype.forEach.call(nodesG.children, function(g){
      var nid = g.dataset.id;
      var keep = !id || nid===id || neighbours(id).indexOf(nid)!==-1;
      g.classList.toggle("dim", !keep);
    });
  }

  function clearHighlight(){
    if(selectedId){ highlight(selectedId); }
    else {
      edgeEls.forEach(function(el){ el.classList.remove("highlight","dim"); });
      Array.prototype.forEach.call(nodesG.children, function(g){ g.classList.remove("dim"); });
    }
  }

  function select(id){
    selectedId = id;
    var n = byId[id];
    Array.prototype.forEach.call(nodesG.children, function(g){
      g.classList.toggle("selected", g.dataset.id===id);
    });
    highlight(id);
    detailType.textContent = n.typeLabel;
    detailTitle.textContent = n.label;
    detailBody.innerHTML = "";
    var p = document.createElement("p"); p.textContent = n.desc; detailBody.appendChild(p);
    var h = document.createElement("h3"); h.textContent = "Source note"; detailBody.appendChild(h);
    var s = document.createElement("div"); s.className="source"; s.textContent = n.source; detailBody.appendChild(s);

    detailConn.innerHTML = "";
    var ch = document.createElement("h3");
    ch.className = "conn-heading";
    ch.textContent = "Connected in this demo";
    detailConn.appendChild(ch);
    var ul = document.createElement("ul"); ul.className="connections";
    neighbours(id).forEach(function(nid){
      var li = document.createElement("li");
      var btn = document.createElement("button"); btn.type="button"; btn.textContent = byId[nid].label;
      btn.addEventListener("click", function(){ select(nid); var el=document.querySelector('.node[data-id="'+nid+'"]'); if(el) el.focus(); });
      li.appendChild(btn); ul.appendChild(li);
    });
    detailConn.appendChild(ul);
  }

  // Build nodes
  NODES.forEach(function(n){
    var g = document.createElementNS(svgNS,"g");
    g.setAttribute("class","node");
    g.setAttribute("tabindex","0");
    g.setAttribute("role","button");
    g.setAttribute("aria-label", n.label + " — " + n.typeLabel + ". Press Enter to view details.");
    g.dataset.id = n.id;

    var c = document.createElementNS(svgNS,"circle");
    c.setAttribute("cx",n.x); c.setAttribute("cy",n.y); c.setAttribute("r",n.r);
    c.setAttribute("fill", COLORS[n.type] || COLORS.place);
    g.appendChild(c);

    var t = document.createElementNS(svgNS,"text");
    t.setAttribute("x",n.x); t.setAttribute("y", n.y + n.r + 16);
    t.setAttribute("text-anchor","middle");
    t.textContent = n.short;
    g.appendChild(t);

    g.addEventListener("click", function(){ select(n.id); });
    g.addEventListener("keydown", function(e){
      if(e.key==="Enter" || e.key===" "){ e.preventDefault(); select(n.id); }
    });
    g.addEventListener("mouseenter", function(){ highlight(n.id); });
    g.addEventListener("mouseleave", clearHighlight);
    g.addEventListener("focus", function(){ highlight(n.id); });
    g.addEventListener("blur", clearHighlight);
    nodesG.appendChild(g);
  });

  function applyZoom(){
    // Zoom around centre of the viewBox (360,260)
    viewport.setAttribute("transform","translate(360 260) scale("+scale+") translate(-360 -260)");
  }
  document.getElementById("zoom-in").addEventListener("click", function(){ scale=Math.min(1.8, +(scale+0.2).toFixed(2)); applyZoom(); });
  document.getElementById("zoom-out").addEventListener("click", function(){ scale=Math.max(0.6, +(scale-0.2).toFixed(2)); applyZoom(); });
  document.getElementById("reset").addEventListener("click", function(){
    scale=1; applyZoom();
    selectedId=null;
    Array.prototype.forEach.call(nodesG.children, function(g){ g.classList.remove("selected"); });
    clearHighlight();
    detailType.textContent="Select a node";
    detailTitle.textContent="Explore Marrow Creek";
    detailBody.innerHTML='<p class="empty">Choose any node in the graph to see how a Graph entry works in this demo: a short description, the connections around it, and the source it came from — all fictional here.</p>';
    detailConn.innerHTML="";
  });

  // Start with the town selected so the panel is instructive on load / mobile
  select("town");
})();
