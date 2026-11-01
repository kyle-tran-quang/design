const fs = require("fs");
const path = "output/kyletran/assets/js/toplevel-deps.js";
const content = fs.readFileSync(path, "utf8");

const target = `function Ft(e){let{speed:t,smoothing:n,image:r,style:i}=e,o=s(null),c=s(t),l=s(n);return c.current=t,l.current=n,h(()=>{let e=o.current;if(!e||a.matchMedia(\`(prefers-reduced-motion: reduce)\`).matches)return;let t=a.scrollY*c.current,n=0,r=()=>{let i=a.scrollY*c.current;t+=(i-t)*l.current,Math.abs(i-t)<.01&&(t=i),e.style.transform=\`rotate(\${t}deg)\`,n=t===i?0:requestAnimationFrame(r)},i=()=>{n||=requestAnimationFrame(r)};return i(),a.addEventListener(\`scroll\`,i,{passive:!0}),()=>{a.removeEventListener(\`scroll\`,i),cancelAnimationFrame(n)}},[]),/*#__PURE__*/ d(\`img\`,{ref:o,src:r?.src??It,alt:\`\`,"aria-hidden":\`true\`,draggable:!1,style:{...i,width:\`100%\`,height:\`100%\`,objectFit:\`contain\`,willChange:\`transform\`}})}`;

if (!content.includes(target)) {
  console.error("Error: Target code block not found in file!");
  process.exit(1);
}

const replacement = `function Ft(e) {
  let {speed:t,smoothing:n,image:r,style:i}=e,
      imgRef=s(null),
      c=s(t),
      l=s(n),
      [isHovered,setIsHovered]=o(!1);
  return c.current=t,l.current=n,h(()=>{
    let e=imgRef.current;
    if(!e||a.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let t=a.scrollY*c.current,
        n=0,
        r=()=>{
          let i=a.scrollY*c.current;
          t+=(i-t)*l.current,
          Math.abs(i-t)<.01&&(t=i),
          e.style.transform="rotate("+t+"deg)",
          n=t===i?0:requestAnimationFrame(r)
        },
        i=()=>{n||=requestAnimationFrame(r)};
    return i(),a.addEventListener("scroll",i,{passive:!0}),
    ()=>{a.removeEventListener("scroll",i),cancelAnimationFrame(n)}
  },[]),
  /*#__PURE__*/ d("div",{
    onMouseEnter:()=>setIsHovered(!0),
    onMouseLeave:()=>setIsHovered(!1),
    style:{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible"},
    children:[
      /*#__PURE__*/ d("img",{
        ref:imgRef,
        src:r?.src??It,
        alt:"",
        "aria-hidden":"true",
        draggable:!1,
        style:{...i,width:"100%",height:"100%",objectFit:"contain",willChange:"transform",cursor:"pointer"}
      }),
      isHovered&&/*#__PURE__*/ d("div",{
        className:"nav-hover-window",
        onClick:e=>e.stopPropagation(),
        onMouseDown:e=>e.stopPropagation(),
        onMouseUp:e=>e.stopPropagation(),
        style:{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%) translateY(16px)",width:"208px",backgroundColor:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid rgba(0, 0, 0, 0.08)",borderRadius:"12px",padding:"6px",boxShadow:"0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)",zIndex:99999,display:"flex",flexDirection:"column",gap:"4px",pointerEvents:"auto",textAlign:"left"},
        children:[
          /*#__PURE__*/ d("style",{
            dangerouslySetInnerHTML:{
              __html:"@keyframes navReveal { from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.96); } to { opacity: 1; transform: translateX(-50%) translateY(16px) scale(1); } } .nav-hover-window { animation: navReveal 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; } .nav-hover-item { transition: background-color 0.15s ease, color 0.15s ease; }"
            }
          }),
          ...(()=> {
            let e=typeof window<"u"&&(window.location.pathname.includes("/work/")||window.location.href.includes("/work/")),
                t=e?"../":"./",
                n=e?"./":"./work/",
                i=[
                  {name:"Breadslice",path:n+"breadslice.html"},
                  {name:"Unblok",path:n+"unblok.html"},
                  {name:"Car Doctor",path:n+"cardoctor.html"},
                  {name:"Car Doctor DS",path:n+"cardoctor-ds.html"},
                  {name:"MAS Pricing",path:n+"mas-pricing.html"}
                ];
            return [
              ...i.map(e=>{
                let n=typeof window<"u"&&window.location.pathname.endsWith(e.path.split("/").pop());
                return/*#__PURE__*/ d("a",{
                  href:e.path,
                  className:"nav-hover-item",
                  style:{display:"flex",alignItems:"center",padding:"6px 12px",borderRadius:"4px",textDecoration:"none",backgroundColor:n?"rgba(0,0,0,0.05)":"transparent",color:n?"#FA680C":"#ADA9A3",fontFamily:"'Mikado', Inter, sans-serif",fontSize:"13px",fontWeight:400,lineHeight:"16.9px",letterSpacing:"-0.0059em"},
                  onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#D0D0D0",e.currentTarget.style.color="#FA680C"},
                  onMouseLeave:e=>{e.currentTarget.style.backgroundColor=n?"rgba(0,0,0,0.05)":"transparent",e.currentTarget.style.color=n?"#FA680C":"#ADA9A3"},
                  children:e.name
                })
              }),
              /*#__PURE__*/ d("div",{
                style:{height:"1px",backgroundColor:"rgba(0, 0, 0, 0.05)",margin:"4px 6px"}
              }),
              /*#__PURE__*/ d("a",{
                href:t+"index.html",
                className:"nav-hover-item",
                style:{display:"flex",alignItems:"center",padding:"6px 12px",borderRadius:"4px",textDecoration:"none",backgroundColor:"transparent",color:"#ADA9A3",fontFamily:"'Mikado', Inter, sans-serif",fontSize:"13px",fontWeight:400,lineHeight:"16.9px",letterSpacing:"-0.0059em"},
                onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#D0D0D0",e.currentTarget.style.color="#FA680C"},
                onMouseLeave:e=>{e.currentTarget.style.backgroundColor="transparent",e.currentTarget.style.color="#ADA9A3"},
                children:"Back to Home"
              })
            ];
          })()
        ]
      })
    ]
  })
}`;

fs.writeFileSync(path, content.replace(target, replacement));
console.log("Success! Replacement written.");
