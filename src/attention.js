// Credit only visible checkout time inside a short window after real interaction.
export function createAttentionTracker(){
 let last=null,lastTouch=-Infinity,lastCount=-Infinity,wasCheckout=false;
 return {touch(now){lastTouch=now;const counted=now-lastCount>=2000;if(counted)lastCount=now;return counted;},
 tick(now,{checkout,visible}){let seconds=0;if(last!==null&&wasCheckout&&checkout&&visible&&now-lastTouch<=15000)seconds=Math.min(2000,Math.max(0,now-last))/1000;last=now;wasCheckout=checkout&&visible;return seconds;},
 reset(){last=null;lastTouch=-Infinity;lastCount=-Infinity;wasCheckout=false;}};
}
