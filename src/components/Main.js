require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';  //这个很重要
// let yeomanImage = require('../images/1.jpg');
let imgDatas=require('../data/imageDatas.json');

//取到每个图片的地址
imgDatas=(function getImgURL(imgDatasArr) {
    for(var i=0,j=imgDatasArr.length;i<j;i++){
      var singleImaData=imgDatasArr[i];
      singleImaData.imgURL=require('../images/'+singleImaData.filename);
      imgDatasArr[i]=singleImaData;
    }
   return imgDatasArr;
})(imgDatas);
//获取区间内的随机值
function getRangeRandom(low,high) {
   return Math.ceil(Math.random()*(high-low)+low);
}
//限制旋转角度(0-30°)
function get30DegRandom() {
  return ((Math.random()>0.5?"":"-")+Math.ceil(Math.random()*30));
}

// var ImgFigure=React.createClass({
//     render:function () {
//       var styleObj={};
//       if(this.props.arrange.pos){
//         styleObj=this.props.arrange.pos;
//       }
//
//       return (
//         <figure className="img-figure">
//           <img src={this.props.data.imgURL} alt={this.props.data.title}/>
//           <figcaption>
//             <h2 className="img-title">{this.props.data.title}</h2>
//           </figcaption>
//         </figure>
//       );
//     }
// })

class ImgFigure extends React.Component{
  constructor(props){
    super(props);
    this.handleClick=this.handleClick.bind(this);
  }
  //img的点击处理函数
  handleClick(e){

    //如果图片居中让它翻转，否则让它居中
    if(this.props.arrange.isCenter){
      this.props.inverse();  //取不到props属性，这是因为通过ES6类的继承实现创建组件,加上constructor里的内容
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }


  render(){
    var styleObj={};

    //如果props属性中制定了这张图片的地址 则使用
    if(this.props.arrange.pos){
      styleObj=this.props.arrange.pos;
    }

    //如果图片的旋转角度有值且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      //兼容性  要采用驼峰式写法
      (['MozTransform','msTransform','WebkitTransform','transform']).forEach(function (value) {
        styleObj[value]='rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this));

    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex=11;
    }

    var imgFigureClassName='img-figure';
    imgFigureClassName+=this.props.arrange.isInverse?' is-inverse':'';
    //此时的className是个变量，应该用{},而不是''
    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imgURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );

  }
}

//创建控制组件
class ControllerUnit extends React.Component{
  constructor(props){
    super(props);
    this.handleClick=this.handleClick.bind(this);
  }
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }
  render(){
    var controllerUnitClassName='controller-unit';
    //如果同时对应的是居中的图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter){
      controllerUnitClassName+=' is-center';
      //如果同时对应的是翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        controllerUnitClassName+=' is-inverse';
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}

class AppComponent extends React.Component {

  constructor(props){
    super(props);
    this.Constant={
      centerPos:{
        left:0,
        right:0
      },
      hPosRange:{
        leftSecX:[0,0],
        rightSecX:[0,0],
        y:[0,0]
      },
      vPosRange:{
        x:[0,0],
        topY:[0,0]
      }
    };
    this.state={
      imgsArrangeArr:[
        //初始化
        // {
        //   pos:{
        //     left:'0',
        //     top:'0'
        //   }
        // rotate:0,
        // isInverse:false  //图片正反面  false(正面)
        // isCenter:false //图片是否居中
        // }
      ]
    }
  }
  //翻转图片 输入当前被执行inverse操作的图片对应的图片信息数组的index值
  //@return {Function} 这是一个闭包函数，其内return一个真正待被执行的函数
  //闭包就是读取其他函数内部变量的函数，定义在函数内部的函数，将函数内部与函数外部连接起来的桥梁
  inverse(index){
    return function () {
      var imgsArrangeArr=this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse= !imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr:imgsArrangeArr
      })
    }.bind(this);
  }



  //布局所有图片(随意布局)
  range(centerIndex){
    var imgsArrangeArr=this.state.imgsArrangeArr,
      Constant=this.Constant,
      centerPos=Constant.centerPos,
      hPosRange=Constant.hPosRange,
      vPosRange=Constant.vPosRange,
      hPosRangeLeftSecX=hPosRange.leftSecX,
      hPosRangeRightSecX=hPosRange.rightSecX,
      hPosRangeY=hPosRange.y,
      vPosRangeTopY=vPosRange.topY,
      vPosRangeX=vPosRange.x,
      imgsArrangeTopArr=[],
      topImgNum=Math.floor(Math.random()*2),
      topImgSpliceIndex=0,
      imgsArrangCenterArr=imgsArrangeArr.splice(centerIndex,1);

    //首先居中centerIndex的图片
    imgsArrangCenterArr[0].pos=centerPos;
    //剧中的图片不需要旋转
    imgsArrangCenterArr[0].rotate=0;
    imgsArrangCenterArr[0]={
      pos:centerPos,
      rotate:0,
      isCenter:true
    }

    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex=Math.ceil(Math.random()*(imgsArrangeArr.length-topImgNum));
    imgsArrangeTopArr=imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function (value,index) {
      imgsArrangeTopArr[index]={
        pos:{
          top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },


        rotate:get30DegRandom(),
        isCenter:false

      };
    });

    //布局左右两侧的图片
    for(var i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
      var hPosRangeLORX=null;

      if(i<k){
        hPosRangeLORX=hPosRangeLeftSecX;
      }else{
        hPosRangeLORX=hPosRangeRightSecX;
      }
      imgsArrangeArr[i]={
        pos:{
          top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex,0,imgsArrangCenterArr[0]);
    this.setState({
      imgsArrangeArr:imgsArrangeArr
    });


  }

  //利用range函数居中对应index的图片 闭包
  center(index){
    return function () {
      this.range(index);
    }.bind(this);
  }

  componentDidMount(){
    //舞台的大小
    let stageDOM=ReactDOM.findDOMNode(this.refs.stage),
      stageW=stageDOM.scrollWidth,
      stageH=stageDOM.scrollHeight,
      halfStageW=Math.ceil(stageW/2),
      halfStageH=Math.ceil(stageH/2);
    //imgFigure的大小
    let imgFigureDOM=ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW=imgFigureDOM.scrollWidth,
      imgH=imgFigureDOM.scrollHeight,
      halfImgW=Math.ceil(imgW/2),
      halfImgH=Math.ceil(imgH/2);
    this.Constant.centerPos={
      left:halfStageW-halfImgW,
      top:halfStageH-halfImgH
    }
    this.Constant.hPosRange.leftSecX[0]=-halfImgW;
    this.Constant.hPosRange.leftSecX[1]=halfStageW-halfImgW*3;
    this.Constant.hPosRange.rightSecX[0]=halfStageW+halfImgW;
    this.Constant.hPosRange.rightSecX[1]=stageW-halfImgW;
    this.Constant.hPosRange.y[0]=-halfImgH;
    this.Constant.hPosRange.y[1]=stageH-halfImgH;

    this.Constant.vPosRange.topY[0]=-halfImgH;
    this.Constant.vPosRange.topY[1]=halfStageH-halfImgH*3;
    this.Constant.vPosRange.x[0]=halfStageW-imgW;
    this.Constant.vPosRange.x[1]=halfStageW;
    //第一张
    this.range(0);
  }


  render() {
    var controllerUnits=[],imgFigures=[];

    imgDatas.forEach(function (value,index) {
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:'0',
            top:'0'
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        }
      }
      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
      //注意添加的位置
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);


    }.bind(this));

    return (

      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
