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

var view_stub = {
  "players": ["Felix", "Anna Lena", "Cat"],
  "playersAbbreviated": ["F", "AL", "C"],
  "scoreboardTable": [
    [20, 0, -10, 0, 20, 0],
    [50, 1, 10, 0, 10, 1],
    ["", 2, "", 1, "", 0],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ],
  "thisPlayer": "Felix",
  "hasTrumpCard": false,
  "trump": { "suit": "Y", "rank": "Z" },
  "currentRound": 3,
  "currentPhase": "Play",
  "playerState": "play",
  "illegal_tricks": 0,
  "activePlayer": "Fox",
  "tablePlayers": ["Cat", "Dog"],
  "tableCards": [
    { "suit": "R", "rank": "13" },
    { "suit": "Y", "rank": "N" },
  ],
  "hand_cards": [
    { "suit": "B", "rank": "13" },
    { "suit": "G", "rank": "Z" },
  ],
  "actualTricks": [0, 2, 1],
  "hasLastGame": true,
  "isLobbyMode": true,
}

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
    <Row>
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
    <Button variant="primary" onClick={api.announceTricks}>
      Submit
  </Button>
  </Form>
}

function GameControl(props) {
  let content = null
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

export function App(props) {
  if (props.state.isLobbyMode) {
    return <Lobby state={props.state}></Lobby>
  } else {
    return <Game state={props.state}></Game>
  }
}

function Lobby(props) {
  // TODO Add ranking of last game
  let scoreboard = null
  if (props.state.hasLastGame) {
    scoreboard = <UISection sectionId="scoreboard" sectionName="Last Game">
      <Scoreboard playersAbbreviated={props.state["playersAbbreviated"]}
          scoreboardTable={props.state["scoreboardTable"]}></Scoreboard>
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

