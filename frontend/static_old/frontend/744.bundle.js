"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[744],{8744:(e,n,t)=>{t.r(n),t.d(n,{default:()=>I});var a=t(7294),r=(t(745),t(1559)),l=t(9062),o=t(7484),i=t.n(o),c=(t(5567),t(6036)),u=t.n(c),d=t(2901),m=t(3379),s=t.n(m),f=t(7795),p=t.n(f),h=t(569),b=t.n(h),g=t(3565),y=t.n(g),w=t(9216),x=t.n(w),v=t(4589),E=t.n(v),k=t(2214),A={};A.styleTagTransform=E(),A.setAttributes=y(),A.insert=b().bind(null,"head"),A.domAPI=p(),A.insertStyleElement=x();s()(k.Z,A);const S=k.Z&&k.Z.locals?k.Z.locals:void 0;function _(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var t=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=t){var a,r,l,o,i=[],c=!0,u=!1;try{if(l=(t=t.call(e)).next,0===n){if(Object(t)!==t)return;c=!1}else for(;!(c=(a=l.call(t)).done)&&(i.push(a.value),i.length!==n);c=!0);}catch(e){u=!0,r=e}finally{try{if(!c&&null!=t.return&&(o=t.return(),Object(o)!==o))return}finally{if(u)throw r}}return i}}(e,n)||function(e,n){if(!e)return;if("string"==typeof e)return M(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return M(e,n)}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function M(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,a=new Array(n);t<n;t++)a[t]=e[t];return a}i().extend(u()),i().locale("km");var I=function(){var e=_((0,a.useState)([]),2),n=e[0],t=e[1],o=_((0,a.useState)([]),2),c=o[0],u=o[1];return(0,a.useEffect)((function(){var e="".concat((0,d.N5)(),"://").concat(window.location.host,"/ws/top-join-library/"),n=new WebSocket(e);return n.onmessage=function(e){var n=JSON.parse(e.data);t(n)},function(){n.close()}}),[]),(0,a.useEffect)((function(){var e="".concat((0,d.N5)(),"://").concat(window.location.host,"/ws/monthly-join-library/"),n=new WebSocket(e);return n.onmessage=function(e){var n=JSON.parse(e.data);u(n)},function(){n.close()}}),[]),a.createElement(a.Fragment,null,a.createElement("main",{className:S.main},a.createElement("div",{className:S.statistic_1},a.createElement("table",null,a.createElement("thead",null,a.createElement("tr",null,a.createElement("th",{colSpan:"4",style:{textAlign:"center",borderBottom:"1px solid #e8e7ee"}},"អ្នកចូលបណ្ណាល័យប្រចាំខែ ",i()().format("MMMM"))),a.createElement("tr",null,a.createElement("th",null,"ឈ្មោះ"),a.createElement("th",null,"បុគ្គល"),a.createElement("th",null,"ថ្នាក់"),a.createElement("th",null,"ចូល"))),a.createElement("tbody",null,n.length?a.createElement(a.Fragment,null,n.map((function(e,n){return a.createElement("tr",{key:n},a.createElement("td",null,e.name),a.createElement("td",null,e.individual),a.createElement("td",null,e.grade||"គ្មាន"),a.createElement("td",null,(0,d.uf)(e.score,"km")," ដង"))}))):a.createElement("tr",null,a.createElement("td",{colSpan:"4"},a.createElement(l.Z,null)))))),a.createElement("div",{className:S.statistic_2},a.createElement("span",{className:S.label},"ទិន្ន័យចូលបណ្ណាល័យប្រចាំខែនីមួយៗ"),c.length?a.createElement(r.v,{width:window.innerWidth-55>500?window.innerWidth-55:500,height:450,dataset:c,xAxis:[{scaleType:"band",dataKey:"date",valueFormatter:function(e){return(0,d.uf)(i()(e).format("MMMM YYYY"),"km")}}],series:[{dataKey:"male_student",label:"សិស្សប្រុស",color:"blue",valueFormatter:function(e){return"".concat((0,d.uf)(e,"km")," ដង")}},{dataKey:"female_student",label:"សិស្សស្រី",color:"red",valueFormatter:function(e){return"".concat((0,d.uf)(e,"km")," ដង")}},{dataKey:"male_teacher",label:"គ្រូប្រុស",color:"aqua",valueFormatter:function(e){return"".concat((0,d.uf)(e,"km")," ដង")}},{dataKey:"female_teacher",label:"គ្រូស្រី",color:"rgb(255,150,80)",valueFormatter:function(e){return"".concat((0,d.uf)(e,"km")," ដង")}}]}):a.createElement("div",{style:{padding:"12px"}},a.createElement(l.Z,null)))),a.createElement("span",{className:S.feedback_CPP},"© 2023 ",2023===i()().year()?null:"- "+i()().year()," CHHEM Sophea. All rights reserved."))}},2214:(e,n,t)=>{t.d(n,{Z:()=>i});var a=t(8081),r=t.n(a),l=t(3645),o=t.n(l)()(r());o.push([e.id,".alYk1z14jhh6dzI86_DU{\n  width: 100%;\n  padding: 12px;\n  display: grid;\n  place-items: center;\n  gap: 12px;\n}\n\n._xLrM012vNIo2yLS3oPQ{\n  color: rgb(96, 96, 96);\n  font-family: var(--font-khmer);\n  padding: 12px;\n  text-align: center;\n  font-weight: 600;\n  font-size: max(1.5vw,25px);\n  white-space:nowrap;\n}\n\n\n.MAenRipm_oqIJyaV3StK{\n  width: calc(100% - 12px);\n  background: linear-gradient(to bottom right, #B8C6DB,#F5F7FA);\n  overflow: auto;\n  border-radius: 5px;\n  height: auto;\n\n}\n\n.MAenRipm_oqIJyaV3StK table{\n  text-align:center;\n  border-spacing: 2px;\n  background: #6c79e0;\n  width: 100%;\n\n}\n\n\n.MAenRipm_oqIJyaV3StK thead{\n  position: sticky;\n  z-index: 5 !important;\n}\n\n.MAenRipm_oqIJyaV3StK thead th{\n  background: #6c79e0;\n  color: white;\n  font-family: var(--font-khmer);\n  padding: 12px;\n  padding-left: 18px;\n  text-align: center;\n  font-weight: 600;\n  font-size: max(1.5vw,25px);\n  white-space:nowrap;\n}\n\n.MAenRipm_oqIJyaV3StK tbody td{\n  background: white;\n  font-family: var(--font-khmer);\n  padding: 8px;\n  color: rgb(96, 96, 96);\n  font-size: max(1.25vw,20px);\n  white-space:nowrap;\n  font-weight: 500;\n  width: auto;\n}\n\n.MAenRipm_oqIJyaV3StK tbody tr:nth-child(even) td{\n  background: #e8e7ee;\n}\n\n\n.y9qhmgPml1TUyk0be7RA{\n  width: calc(100% - 12px);\n  background: linear-gradient(to bottom right, #B8C6DB,#F5F7FA);\n  overflow: auto;\n  border-radius: 5px;\n  height: auto;\n  display: grid;\n  place-items: center;\n\n}\n\n.bBAVoeo3eKpxq7xaPCWf{\n  font-family: var(--font-noto-serif);\n  font-weight: 300;\n  font-size: max(1.1vw,18px);\n  text-align: center;\n  background: rgba(255, 255, 255, 0.5);\n  color: white;\n  width: 100%;\n  padding: 8px;\n  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;\n}\n\n",""]),o.locals={main:"alYk1z14jhh6dzI86_DU",label:"_xLrM012vNIo2yLS3oPQ",statistic_1:"MAenRipm_oqIJyaV3StK",statistic_2:"y9qhmgPml1TUyk0be7RA",feedback_CPP:"bBAVoeo3eKpxq7xaPCWf"};const i=o}}]);