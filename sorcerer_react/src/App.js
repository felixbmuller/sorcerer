import React from 'react';

import $ from 'jquery';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Modal from 'react-bootstrap/Modal'

import * as api from "./apiConnector"

function PlayingCard(props) {
  var colorCode = ""
  if (["R", "G", "B", "Y"].includes(props.value["suit"])) {
    colorCode = props.value["suit"] + "Card"
  }
  if (props.playable) {
    return (
      <div className={["playingCard", colorCode, "unselectable", "clickable"].join(" ")}
        onClick={() => api.playCard(props.value["full"])}>
        {props.value["rank"]}
      </div>)
  } else {
    return <div className={["playingCard", colorCode, "unselectable"].join(" ")}>
      {props.value["rank"]}
    </div>
  }
}

function Scoreboard(props) {
  return <Table striped bordered size="sm">
    <thead>
      <th>#</th>
      {props.playersAbbreviated.map((val, idx) => {
        return <th colSpan="2">{val}</th>
      })}
    </thead>
    <tbody>
      {props.scoreboardTable.map((val, idx) => {
        return <tr>
          <td><strong>{idx + 1}</strong></td>
          {val.map((val) => { return <td>{val}</td> })}
        </tr>
      })}
    </tbody>
  </Table>
}

class PlayerList extends React.Component {

  renderPlayer(name, idx) {
    const badges = []

    if (name === this.props.thisPlayer) {
      badges.push(<Badge variant="secondary" style={{marginRight: "0.5em"}}>You</Badge>)
    }

    if (this.props.actualTricks[idx] > 0) {
      badges.push(
        <OverlayTrigger overlay={
          <Tooltip>
            Tricks taken this round
        </Tooltip>
        }>
          <Badge variant="primary">{this.props.actualTricks[idx]}</Badge>
        </OverlayTrigger>)
    }

    return <ListGroup.Item>{name} {badges}</ListGroup.Item>

  }

  render() {
    return <ListGroup variant="flush">
      {this.props.players.map(this.renderPlayer, this)}
    </ListGroup>
  }
}

function TableCards(props) {
  return <Table borderless>
    <tr>
      {props.tablePlayers.map((val) => <th>{val}</th>)}
    </tr>
    <tr>
      {props.tableCards.map((val) => <td><PlayingCard value={val}></PlayingCard></td>)}
    </tr>
  </Table>
}

function Handcards(props) {
  return <Container>
    <Row className="scroll-x">
      {props.cards.map((val) => {
        return <Col>
          <PlayingCard value={val} playable={props.playable}></PlayingCard>
        </Col>
      })}
    </Row>
  </Container>
}

function TrickAnnouncement(props) {
  let text = "How many tricks do you take?"
  if (props.illegalTricks != -1) {
    text += " (not " + props.illegalTricks + ")"
  }
  return <Form inline className="gameControlForm">
    <Form.Label>{text}</Form.Label>
    <Form.Control type="number" defaultValue="0" min="0" id="tricksInput" active>
    </Form.Control>
    <Button type="submit" variant="primary" onClick={api.announceTricks}>
      Submit
  </Button>
  </Form>
}

var prevState = null

function GameControl(props) {
  let content = null
  if (prevState != props.playerState 
    && props.playerState != "waiting" 
    && props.playerState != "pause") {
    beep()
  }
  if (props.playerState == "waiting") {
    content = "Waiting for " + props.activePlayer + "."
  } else if (props.playerState == "play") {
    content = "Click a hand card to play it."
  } else if (props.playerState == "pause") {
    content = "Pause between rounds."
  } else {
    content = <TrickAnnouncement illegalTricks={props.illegalTricks}></TrickAnnouncement>
  }
  const name = "Round " + props.currentRound + " - " + props.currentPhase
  prevState = props.playerState
  return <UISection sectionId="gameControl" sectionName={name}>
    <div id="gameControlContent">{content}</div>
  </UISection>
}

function TrumpCard(props) {
  return <PlayingCard value={props.trump}></PlayingCard>
}

function UISection(props) {
  return <div id={props.sectionId}>
    <Card>
      <Card.Header><strong>{props.sectionName}</strong></Card.Header>
      {props.children}
    </Card>
  </div>
}

function beep() {
  var snd = new  Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
  snd.play();
}



class Ranking extends React.Component {

  renderPlayer(content, idx) {
    var badge = null

    var name = content[0]

    if(idx == 0) {
      badge = <Badge variant="primary" style={{backgroundColor: "#c9b037"}}>1st</Badge>
    } else if (idx == 1) {
      badge = <Badge variant="primary" style={{backgroundColor: "#b4b4b4"}}>2nd</Badge>
    } else if (idx == 2) {
      badge = <Badge variant="primary" style={{backgroundColor: "#ad8a56"}}>3rd</Badge>
    }

    return <ListGroup.Item>{name} {badge}</ListGroup.Item>

  }

  render() {
    return <ListGroup variant="flush">
      {this.props.ranking.map(this.renderPlayer, this)}
    </ListGroup>
  }
}

export function App(props) {
  if (props.state.isLobbyMode) {
    return <Lobby state={props.state}></Lobby>
  } else {
    return <Game state={props.state}></Game>
  }
}

function Lobby(props) {
  // TODO Add ranking of last game
  prevState = null
  let scoreboard = null
  if (props.state.hasLastGame) {
    scoreboard = <UISection sectionId="scoreboard" sectionName="Last Game">
      <Scoreboard playersAbbreviated={props.state["playersAbbreviated"]}
          scoreboardTable={props.state["scoreboardTable"]}></Scoreboard>
    </UISection>
  }
  let ranking = null
  if (props.state.hasLastWinners) {
    ranking = <UISection sectionId="ranking" sectionName="Ranking">
      <Ranking ranking={props.state.ranking}></Ranking>
    </UISection>
  }
  return <div>
    {scoreboard}
    <div id="waitingCard">
      <Card>
        <Card.Title><span id="waitingText">Waiting for Players</span>
          <Spinner animation="grow" role="status">
            <span className="sr-only">Waiting Players...</span>
          </Spinner>
        </Card.Title>
        <Button size="lg" variant="primary" onClick={api.startGame}>Start Game</Button>
      </Card>
      {ranking}
    </div>
    <div id="rightPane">
      <UISection sectionId="players" sectionName="Players">
          <PlayerList thisPlayer={props.state["thisPlayer"]}
            actualTricks={new Array(props.state["players"].length)}
            players={props.state["players"]}></PlayerList>
          <Button variant="primary" onClick={api.removePlayer}>Leave Lobby</Button>
        </UISection>
    </div>
    <Button variant="secondary" onClick={api.resetServer} className="bottomcorner">
          Reset Server</Button>
  </div>
}

function Game(props) {
  return (
    <div>
      <UISection sectionId="scoreboard" sectionName="Scoreboard">
        <Scoreboard playersAbbreviated={props.state["playersAbbreviated"]}
          scoreboardTable={props.state["scoreboardTable"]}></Scoreboard>
      </UISection>
      <div id="main">
        <GameControl
          playerState={props.state["playerState"]}
          activePlayer={props.state["activePlayer"]}
          currentRound={props.state["currentRound"]}
          currentPhase={props.state["currentPhase"]}
          illegalTricks={props.state["illegalTricks"]}
        ></GameControl>
        <UISection sectionId="tableCards" sectionName="Table">
          <TableCards tableCards={props.state["tableCards"]}
            tablePlayers={props.state["tablePlayers"]}></TableCards>
        </UISection>
        <UISection sectionId="handCards" sectionName="Handcards">
          <Handcards cards={props.state["handCards"]} 
            playable={props.state["playerState"] == "play"}></Handcards>
        </UISection>
      </div>
      <div id="rightPane">
        <UISection sectionId="players" sectionName="Players">
          <PlayerList thisPlayer={props.state["thisPlayer"]}
            actualTricks={props.state["actualTricks"]}
            players={props.state["players"]}></PlayerList>
          <Button variant="primary" onClick={api.abortGame}>Abort Game</Button>
        </UISection>
        <UISection sectionId="trump" sectionName="Trump">
          <TrumpCard trump={props.state["trump"]}></TrumpCard>
        </UISection>
      </div>
    </div>
  );
}

export function NameModal(props) {
  // TODO Sane behaviour for ENTER
  // TODO Fix this ting
  var showModal = true
  var handler = function() {
    const input = $("#nameInput").val()
    showModal = false
    props.modalHandler(input)
  }
  return <Modal show={showModal}>
          <Modal.Header>
            <Modal.Title>Choose a Name</Modal.Title>
          </Modal.Header>
  <Modal.Body>
    <p>Enter a player name (or empty for a random name)</p>
    <Form inline onSubmit={handler}>
    <Form.Control type="text" id="nameInput">
    </Form.Control>
  </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={handler}>
      Select
    </Button>
  </Modal.Footer>
</Modal>
}

export default App;

