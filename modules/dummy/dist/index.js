function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function s(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function i(t,n){t.appendChild(n)}function u(t,n,e){const o=function(t){if(!t)return document;const n=t.getRootNode?t.getRootNode():t.ownerDocument;if(n&&n.host)return n;return t.ownerDocument}(t);if(!o.getElementById(n)){const t=f("style");t.id=n,t.textContent=e,function(t,n){i(t.head||t,n)}(o,t)}}function c(t,n,e){t.insertBefore(n,e||null)}function l(t){t.parentNode.removeChild(t)}function f(t){return document.createElement(t)}function a(t){return document.createTextNode(t)}function d(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function p(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}let h;function m(t){h=t}const g=[],$=[],b=[],y=[],x=Promise.resolve();let _=!1;function v(t){b.push(t)}let N=!1;const k=new Set;function w(){if(!N){N=!0;do{for(let t=0;t<g.length;t+=1){const n=g[t];m(n),C(n.$$)}for(m(null),g.length=0;$.length;)$.pop()();for(let t=0;t<b.length;t+=1){const n=b[t];k.has(n)||(k.add(n),n())}b.length=0}while(g.length);for(;y.length;)y.pop()();_=!1,N=!1,k.clear()}}function C(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(v)}}const E=new Set;function O(t,n){-1===t.$$.dirty[0]&&(g.push(t),_||(_=!0,x.then(w)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function z(s,i,u,c,f,a,d,p=[-1]){const g=h;m(s);const $=s.$$={fragment:null,ctx:null,props:a,update:t,not_equal:f,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(i.context||(g?g.$$.context:[])),callbacks:e(),dirty:p,skip_bound:!1,root:i.target||g.$$.root};d&&d($.root);let b=!1;if($.ctx=u?u(s,i.props||{},((t,n,...e)=>{const o=e.length?e[0]:n;return $.ctx&&f($.ctx[t],$.ctx[t]=o)&&(!$.skip_bound&&$.bound[t]&&$.bound[t](o),b&&O(s,t)),n})):[],$.update(),b=!0,o($.before_update),$.fragment=!!c&&c($.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);$.fragment&&$.fragment.l(t),t.forEach(l)}else $.fragment&&$.fragment.c();i.intro&&((y=s.$$.fragment)&&y.i&&(E.delete(y),y.i(x))),function(t,e,s,i){const{fragment:u,on_mount:c,on_destroy:l,after_update:f}=t.$$;u&&u.m(e,s),i||v((()=>{const e=c.map(n).filter(r);l?l.push(...e):o(e),t.$$.on_mount=[]})),f.forEach(v)}(s,i.target,i.anchor,i.customElement),w()}var y,x;m(g)}class S{$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function A(t){u(t,"svelte-bzh57p","div.svelte-bzh57p{color:red}")}function D(n){let e,o,r,s,u,h=JSON.stringify(n[1])+"",m=JSON.stringify(n[0])+"";return{c(){e=f("div"),o=a("This is a dummy module\n\t"),r=a(h),s=a(" "),u=a(m),d(e,"class","svelte-bzh57p")},m(t,n){c(t,e,n),i(e,o),i(e,r),i(e,s),i(e,u)},p(t,[n]){2&n&&h!==(h=JSON.stringify(t[1])+"")&&p(r,h),1&n&&m!==(m=JSON.stringify(t[0])+"")&&p(u,m)},i:t,o:t,d(t){t&&l(e)}}}function J(t,n,e){let{box:o={}}=n,{settings:r={}}=n;return t.$$set=t=>{"box"in t&&e(0,o=t.box),"settings"in t&&e(1,r=t.settings)},[o,r]}function j(t){u(t,"svelte-bzh57p","div.svelte-bzh57p{color:red}")}function T(n){let e;return{c(){e=f("div"),e.textContent="Dummy!",d(e,"class","svelte-bzh57p")},m(t,n){c(t,e,n)},p:t,i:t,o:t,d(t){t&&l(e)}}}function B(t,n,e){let{settings:o={}}=n;return t.$$set=t=>{"settings"in t&&e(0,o=t.settings)},[o]}var M={title:"Dummy Module",uuid:"00000000-0000-0000-0000-000000000000",defaults:{title:"A dummy module",box:{x:0,y:0,width:200,height:200},settings:{}},settingsComponent:class extends S{constructor(t){super(),z(this,t,J,D,s,{box:0,settings:1},A)}},instanceComponent:class extends S{constructor(t){super(),z(this,t,B,T,s,{settings:0},j)}},itemComponent:class extends S{constructor(t){super(),z(this,t,null,null,s,{})}}};export{M as default};
//# sourceMappingURL=index.js.map
