# CSS方案

css的实现方案比较简单，如下

```js
// html
<div className="container">
    ...
    <div className="parent">
        ...
        <div className="content">
            sticky dom
        </div>
        ...
    </div>
    ...
</div>

// css
.container {
    overflow: auto;
    width: 200px;
}
.parent {
    width: 80px;
}
.content {
    position: sticky;
    width: 50px;
}
```
在设置时会遇到设置不生效的问题，经排查找到了问题所在。下面先介绍 sticky 效果中涉及的一些概念及使用条件，从而找到解决方案。

* 粘性布局元素
position设置为sticky的元素（例子中的content）
* 流盒
指粘性定位元素最近的可滚动元素overflow属性值不是visible的元素（例子中的container），如果没有该元素，则选择浏览器视窗；
* 粘性约束矩形
粘性布局元素的父级元素矩形（例子中的parent）

**上述元素在满足以下条件时才能生效**

* 父级（流盒和粘性定位元素之间）元素不能有任何overflow: visible以外的overflow设置，如果CSS设置无效，查看是否存在某一个父级元素设置了overflow: hidden，移除即可
* 必须指定top/left/right/bottom任一个方向的属性值
* 粘性布局元素作用域在父元素（即：粘性约束矩形）内，效果在父元素内生效
* 父元素（即：粘性约束矩形）高度必须大于粘性布局元素的高度。二者一样高时，父元素的高度最大和粘性定位元素一样高，粘性定位元素已经完全没有了实现粘性效果的空间

遇到的不生效的情况从上面几点排查就能找到原因了。

# JS方案

JS方案是通过监听滚动的元素的滚动事件实现。为了实现滚动的顺畅，使用transform: translateZ(0); 来开启硬件加速。

```js
<SingleSticky
    getScrollContainer={() => document.getElementById('b')}
    // getWrapContainer={() => document.getElementById('a')} // 可不填写，若填写则需要设置 a position: relative
    // bottomOffset={30}
    topOffset={30}>
    <div>
        {/* ... */}
    </div>
</ReactSingleSticky>

[多个模块堆叠吸顶](http://react-sticky.netlify.app/#/stacked)


// StickyContainer 和 getScrollContainer CSS 方案中的 粘性约束矩形
// ReactSingleSticky满足了所有场景，设置 getScrollContainer 可以实现上述案例，也可以用  StickyContainer + Sticky 代替

<StickyContainer
    getScrollContainer={() => document.getElementById('b')}>
    {/* ... */}
    <Sticky
        // bottomOffset={30}
        topOffset={30}>
        <div style={style}>
            {/* ... */}
        </div>
    </Sticky>
    {/* ... */}
</StickyContainer>
```