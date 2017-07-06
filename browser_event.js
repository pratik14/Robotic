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
    if( this.formSubmitOnEnter() ){
      var closest_form = this.closest(this.event.target, 'form');
      return {
        operation: 'action',
        trigger: 'Submit',
        time: this.getTime(),
        locator: XPath.get(closest_form),
        text: this.event.target.value,
        display_message: 'Text: ' + this.event.target.value
      }
    }
    else {
      return {
        operation: 'action',
        trigger: 'Click',
        time: this.getTime(),
        locator: XPath.get(this.event.target),
        text: this.event.target.text,
        display_message: 'Text: ' + this.event.target.innerText
      }
    }
  }

  changeAttrs(){
    if( this.selectButton() ) {
      var selectedIndex = this.event.target.selectedIndex;
      var text = this.event.target.options[selectedIndex].text;
      return {
        operation: 'action',
        trigger: 'Select',
        time: this.getTime(),
        locator: XPath.get(this.event.target),
        text: text,
        display_message: 'Select option with text: ' + text,
      }
    } else if( this.checkBox() ){
      var selected = this.event.target.checked;
      if(selected == 1){
        var display_message = 'Checkbox should be selected';
      } else{
        var display_message = 'Checkbox should not be selected';
      }
      return {
        operation: 'action',
        trigger: 'Checbox',
        time: this.getTime(),
        locator: XPath.get(this.event.target),
        text: selected,
        display_message: display_message,
      }
    } else {
      return {
        operation: 'action',
        trigger: 'Change',
        time: this.getTime(),
        text: this.event.target.value,
        locator: XPath.get(this.event.target),
        display_message: 'Txt Change: ' + this.event.target.value
      }
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

  selectButton(){
    return (this.event.target.type == 'select-one')
  }

  checkBox(){
    return (this.event.target.type == 'checkbox')
  }

  closest(el, selector) {
    var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

    while (el) {
      if (matchesSelector.call(el, selector)) {
        break;
      }
      el = el.parentElement;
    }
    return el;
  }
}
