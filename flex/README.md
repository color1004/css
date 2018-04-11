设置包裹元素(pond )
justify-content(元素水平间距)
  flex-start flex-end center space-between(紧靠两边) space-around  
align-items（垂直元素排列）
  flex-start flex-end center baseline(元素在容器的基线位置显示) stretch (元素被拉伸以填满整个容器)
  元素行间距是固定的，无法调整
flex-direction(元素排列顺序)
  row row-reverse column column-reverse （column之后水平和垂直content调转，reverse之后flex-end和flex-start被调转）
flex-wrap（是否换行）
  nowrap wrap wrap-reverse
flex-flow（flex-direction和flex-wrap的合并）
flex-direction和flex-wrap，先direction后warp空格间隔，示例： row nowrap
align-content(元素垂直间距)
flex-start flex-end center space-between space-around 
  可用来调整行间距
place-content
  水平垂直间距，合并justify-content和align-content，先align后justify，空格间隔，示例： space-around  center 

设置元素本身(frog / red)
order（默认为0，该值可正可负，相对于当前元素前进或后退）
  number数值  -2  -1  0   1  2 ...
align-self（值同align-items，可覆盖align-items）
  flex-start flex-end center baseline stretch
