class BrowserEvent {
  constructor(event) {
    this.event = event;
  }

  getAttrs(){
    switch( this.event.type ){
      case 'click':
        return this.clickAttrs();
        break
      case 'change':
        return this.changeAttrs();
        break
      case 'hover':
        return this.hoverAttrs();
        break
    }
  }

  getTime(){
    return new Date().getTime();
  }

  clickAttrs(){
   return {
     operation: 'action',
     trigger: 'Click',
     time: this.getTime(),
     locator: XPath.get(this.event.target),
     display_message: 'Text: ' + this.event.target.innerText
   }
  }

  changeAttrs(){
   return {
     operation: 'action',
     trigger: 'Change',
     time: this.getTime(),
     text: this.event.target.value,
     locator: XPath.get(this.event.target),
     display_message: 'Txt Change: ' + this.event.target.value
   }
  }

  hoverAttrs(){
   return {
     operation: 'action',
     trigger: 'Hover',
     time: this.getTime(),
     text: this.event.target.value,
     locator: XPath.get(this.event.target),
     display_message: 'Element hovered'
   }
  }

  onLoadAttrs(){
    return {
      trigger: 'Load',
      time: this.getTime(),
      display_message: ''
    }
  }

  goToAttrs(url){
    return {
      trigger: 'GoTo',
      time: this.getTime(),
      url: url,
      display_message: 'Goto URL: ' + url
    }
  }

  targetType(){
    return this.event.target.type.toUpperCase();
  }

  targetTag(){
    return this.event.target.tagName.toUpperCase();
  }

  ctrlKey(){
    return this.event.ctrlKey || this.event.metaKey;
  }

  shiftKey(){
    return this.event.shiftKey;
  }

  valid(){
    var type = this.targetTag();
    var SHIFT_KEYCODE = 16;
    var ESC_KEYCODE = 27;
    switch( this.event.type ){
      case 'click':
        if( this.formSubmitOnEnter() ){ return false; }
        return !( ["INPUT", "FILE", "SELECT"].some(n => type === n) );
        break;
      case 'change':
        return ["INPUT", "FILE", "SELECT"].some(n => type === n);
        break;
      case 'hover':
        return (!this.ctrlKey() && this.event.keyCode === SHIFT_KEYCODE && type != 'INPUT')
        break;
    }
  }

  formSubmitOnEnter(type, event){
    return (this.targetTag() == 'INPUT' && this.targetTag() == 'SUBMIT')
  }
}
