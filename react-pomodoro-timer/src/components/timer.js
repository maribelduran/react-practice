import React, {Component} from 'react';
import ProgressBar from 'react-progress-bar.js';
import SessionCounter from './session_counter';
import Navigation from './navigation';
import {Button, Modal} from 'react-bootstrap';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import classNames from 'classnames';
import './bootstrap-slider.min.css';

const options = {
  color: '#FC6E6E',
  strokeWidth: 4,
  trailColor: '#D2D3D7',
  trailWidth: 4,
}

const SESSION_TIME = 10;
const BREAK_TIME = 10;
const MAX_SESSIONS = 8;

const secondsToMs = (sec) => {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  m = (m.toString().length === 1) ? "0" + m: m;
  s = (s.toString().length === 1) ? "0" + s: s;
  return (m + ":" + s);
}

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secondsSet: parseInt(SESSION_TIME, 10) * 60, //seconds
      secondsLeft: parseInt(SESSION_TIME, 10) * 60, //seconds
      sessionLen: SESSION_TIME, //minutes
      breakLen: BREAK_TIME, //minutes
      sessionSettingLen: SESSION_TIME, //minutes
      breakSettingLen: BREAK_TIME, //minutes
	    timeElapsed: 0, //decimal representing the percentage
	    name: "Let's Focus!",
	    isRunning: false,
      sessionsCompleted: 0,
      modalIsOpen: false,
    };
    this.toggleTimer = this.toggleTimer.bind(this);
    this.onResetTimer = this.onResetTimer.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.switchTimers = this.switchTimers.bind(this);
    this.countDown = this.countDown.bind(this);

    this.openModal = this.openModal.bind(this);
    this.onSaveSettings = this.onSaveSettings.bind(this);
    this.onCancelChanges = this.onCancelChanges.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.changeSessionSettingsLen =this.changeSessionSettingsLen.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false
    });
  }

  changeSessionSettingsLen(event){
    var value = event.target.value || event.target;
    this.setState({sessionSettingLen:  value});
  }

  onCancelChanges(){
    const {sessionLen, breakLen } = this.state
    this.closeModal();
    this.setState({
      sessionSettingLen: sessionLen,
      breakSettingLen: breakLen
    });
  }

  onSaveSettings(){
    this.stopTimer();
    const {sessionSettingLen} = this.state;
    this.setState({
      sessionLen: sessionSettingLen,
      secondsSet: parseInt(sessionSettingLen, 10) * 60,
      secondsLeft: parseInt(sessionSettingLen, 10) * 60,
      timeElapsed: 0,
    })
    this.closeModal();
  }

  startTimer({name}){
    const {sessionsCompleted} = this.state
    if (sessionsCompleted < MAX_SESSIONS && !this.isRunning){
      this.setState({
        name: name,
        isRunning: true,
      });
      this.timerID = setInterval(
        () => this.countDown(),
        1000
      );
    }
  }

  onResetTimer(){
     this.stopTimer();
     this.setState({
      name: "Session",
      secondsSet: parseInt(SESSION_TIME, 10) * 60,
      secondsLeft: parseInt(SESSION_TIME, 10) * 60,
      sessionLen: SESSION_TIME,
      breakLen: BREAK_TIME,
      timeElapsed: 0,
      sessionsCompleted: 0,
     });
  }

  countDown() {
    let {secondsLeft, secondsSet} = this.state;
    if (secondsLeft > 0){
        secondsLeft -= 1;
        const timeElapsed = (secondsSet - secondsLeft)/secondsSet;
        this.setState({
        secondsLeft: secondsLeft,
        timeElapsed: timeElapsed,
      });   
    }else{
      this.switchTimers();
    }	
  }

  toggleTimer(){
    let {name, isRunning} = this.state;
    if (isRunning){
      this.stopTimer();
    }
    else{
      //Want to figure out a better way to represent when the timer hasn't been started before
      if (name === "Let's Focus!") { name = "Session";}
      this.startTimer({name: name });
    }
  }

  switchTimers(){
    const {name, sessionsCompleted, breakLen, sessionLen} = this.state;
    if (name === "Session"){
      this.setState({
        name: "Break",
        secondsSet: parseInt(breakLen, 10) * 60,
	      secondsLeft: BREAK_TIME,
        timeElapsed: 0,
        sessionsCompleted: sessionsCompleted + 1,
      }); 
      this.stopTimer();
    }else if (name === "Break"){    
      this.stopTimer();
      this.setState({
        name: "Session",
        secondsSet: parseInt(sessionLen, 10) * 60,
	      secondsLeft: sessionLen,
	      timeElapsed: 0,
      });
    }
    this.startTimer({name: this.state.name});   
  }

  stopTimer(){
    clearInterval(this.timerID);
    this.setState({isRunning: false});
  }
  render(){
    const Circle = ProgressBar.Circle;
    const {
      secondsLeft,
      name,
      sessionsCompleted,
      timeElapsed,
      isRunning,
      } = this.state;
    
      const toggleClasses = classNames(
        'fa', 'fa-3x', 
        {'fa-pause': isRunning}, 
        {'fa-play': !isRunning}
        );
  
    return(
      <div>
      <Navigation onReset={this.onResetTimer} onOpenModal={this.openModal} />
      <div className="modal-container">
        <Modal
          show={this.state.modalIsOpen}
          onHide={this.onCancelChanges}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">
              Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          SessionLength:
          <ReactBootstrapSlider
            value={this.state.sessionSettingLen}
            slideStop={this.changeSessionSettingsLen}
            min={1}
            max={60}
            >
           </ ReactBootstrapSlider>

           

          </Modal.Body>
          <Modal.Footer>
            <Button  bsStyle="default" onClick={this.onCancelChanges}>Cancel</Button>
            <Button  bsStyle="primary" onClick={this.onSaveSettings}>Save Changes</Button>
          </Modal.Footer>
        </Modal>
      </div>
       
      <div id="content">
      <h1 id="timerName">{name}</h1>
      <Circle className="progressBarContainer"
        progress={timeElapsed}
        options={options}
        initialAnimate={false}
        
      />
      <div className="row">
        <h2 id="timer">{secondsToMs(secondsLeft)}</h2>
      <button 
        id="toggleTimer" onClick={this.toggleTimer}
      >
        <i id="toggleIcon" className={toggleClasses} aria-hidden="true"></i>
      </button>
    </div>
    <SessionCounter 
    sessionsAvailable={MAX_SESSIONS}
    sessionsCompleted={sessionsCompleted}
    SessionCounter/> 
  </div>
  </div>
    )
  } 
}

export default Timer;