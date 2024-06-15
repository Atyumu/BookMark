var fromIdx;
var toIdx;
window.addEventListener("load",function(){
    addDragEvent();
});

/**
 * trにドラッグイベントを付与する。
 */
const addDragEvent = function(){
    document.querySelectorAll("tbody tr").forEach(function(e){
        e.addEventListener("dragstart",{element:e, handleEvent:dragStart});
        e.addEventListener("dragend",{element:e, handleEvent:dragEnd});
        e.addEventListener("dragenter",{element:e, handleEvent:dragEnter});
        e.addEventListener("dragover",{element:e, handleEvent:dragOver});
        e.addEventListener("drop",{element:e, handleEvent:dragDrop});
    });
}

/**
 * テキストエリアにログを出力
 * @param {string} str 
 */
var tlog = function(str){
    document.querySelector("textarea").value += str + "\r\n"
}

/**
 * ドラッグ開始時
 */
var dragStart = function(){
    this.element.classList.add("dragging");
    fromIdx = parseInt(this.element.id.substring(3));
};

/**
 * ドラッグ終了時
 */
var dragEnd = function(){
    var el = this.element;
    this.element.classList.remove("dragging");
    document.querySelectorAll("tbody tr").forEach(function(e2,i){
        if(e2.id === el.id){
            toIdx = i;
        }
    });
    if(fromIdx < toIdx){
        for(i = fromIdx; i < toIdx; i++){
            ss(i,i+1);
        }
    }else{
        for(i = fromIdx; i > toIdx; i--){
            ss(i,i-1);
        }
    }
    app.rerender();
}
/**
 *  
 */
var dragEnter = function(){
    var fromId = "tr_"+fromIdx;
    var toId = this.element.id;
    if(fromId !== toId) {
        const tbody = document.querySelector("tbody");
        const row1 = document.getElementById(fromId);
        const row2 = document.getElementById(toId);

        // 一時的な要素を作成してrow1を挿入
        const temp = document.createElement("tr");
        tbody.insertBefore(temp, row1);

        // row1をrow2の前に挿入
        tbody.insertBefore(row1, row2);

        // row2を一時的な要素の前に挿入
        tbody.insertBefore(row2, temp);

        // 一時的な要素を削除
        tbody.removeChild(temp);
    };

};

var ss = function(idx1,idx2){
    var map1 = app.bookmarkList[idx1];
    var map2 = app.bookmarkList[idx2];
    app.bookmarkList.splice(idx1,1,map2);
    app.bookmarkList.splice(idx2,1,map1);
}

var dragOver = function(e){
    e.preventDefault()
}

var dragDrop = function(e){

    e.preventDefault()
};

const createList = function(list,json){
    let length = list.length
    for(i=0; i<length; i++){
        list.pop();
    }
    json.forEach(function(e){
        list.push({
            title:e.title,
            url:e.url,
        });
    });
}


var app = new Vue({
    el: "#app",
    data:{
        storageKey:"test",
        newTitle:"",
        newUrl:"",
        bookmarkList:[],
        importFile:"",
        componentKey:0,
    },
    methods:{
        //サイトの追加
        addBookmark:function(){
            this.bookmarkList.push({
                title:this.newTitle,
                url:this.newUrl
            })
            this.newTitle = "";
            this.newUrl = "";
        },
        //遷移(target="_blank")
        redirect: function(url){
            window.open(url,"_blank")
        },
        //削除
        remove: function(index){
            this.bookmarkList.splice(index,1);
        },
        exportBookmarks: function(){
            var length = this.bookmarkList.length;
            var json = [];
            for(let i = 0; i<length; i++){
                json.push({
                    folder:this.bookmarkList[i].folder,
                    title:this.bookmarkList[i].title,
                    url:this.bookmarkList[i].url,
                });
            }
            var content = JSON.stringify(json);
            var blob = new Blob([...content],{"type":"application/json"});
            var objectUrl = window.URL.createObjectURL(blob);
            var link = document.createElement("a");
            document.body.appendChild(link);
            link.href = objectUrl;
            link.download = "bookmarks.json"
            link.click();
            document.body.removeChild(link);
        },
        //インポート
        importBookmarks:function(e){
            var file = e.currentTarget.files[0];
            var bookmarkList = this.bookmarkList;
            if(file){
                const reader = new FileReader();
                reader.onload = function(e){
                    const json = e.target.result;
                    try{
                        var obj = JSON.parse(json);
                        createList(bookmarkList,obj);
                    }catch(error){
                        console.log(error);
                    }
                    e.target.value = "";
                }
                reader.readAsText(file);
            }
        },
        rerender:function(){
            this.componentKey += 1;
        }
    },
    created: function(){
        var bookmark = localStorage.getItem(this.storageKey);
        if(bookmark){
            var json = JSON.parse(bookmark);
            this.bookmarkList = json;
        }
    },
    updated: function(){
        addDragEvent();
    },
    watch:{
        bookmarkList:{
            //ローカルストレージに保存
            handler: function(){
                localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarkList));
            },
            deep:true,
        }
    }
});