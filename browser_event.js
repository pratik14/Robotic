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
      case 'keydown':
        return this.keydownAttrs();
        break
    }
  }

  getTime(){
    return new Date().getTime();
  }

  clickAttrs(){
   let display_message =  this.event.target.innerText
   if( this.formSubmitOnEnter() ){
     display_message = this.event.target.value;
   }
   return {
     operation: 'action',
     trigger: 'Click',
     time: this.getTime(),
     locator: XPath.get(this.event.target),
     text: display_message,
     display_message: 'Text: ' + display_message 
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

  keydownAttrs(currEl, trigger){
   return {
     operation: 'action',
     trigger: trigger,
     time: this.getTime(),
     text: currEl.innerText,
     locator: XPath.get( currEl ),
     display_message: 'Text: ' + currEl.innerText
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
        if( this.formSubmitOnEnter() ){ return true; }
        return !( ["INPUT", "FILE", "SELECT"].some(n => type === n) );
        break;
      case 'change':
        if( this.formSubmitOnEnter() ){ return false; }
        return ["INPUT", "FILE", "SELECT"].some(n => type === n);
        break;
      case 'keydown':
        return (!this.ctrlKey() && this.event.keyCode === SHIFT_KEYCODE && type != 'INPUT')
        break;
    }
  }

  formSubmitOnEnter(){
    return (this.targetTag() == 'INPUT' && this.targetType() == 'SUBMIT')
  }
}
