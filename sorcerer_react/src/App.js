import React from 'react';
import './App.css';
import './App.scss';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

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

import GridLayout from 'react-grid-layout';

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
  "playerState": "tricks",
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
}

function PlayingCard(props) {
  var colorCode = ""
  if (["R", "G", "B", "Y"].includes(props.value["suit"])) {
    colorCode = props.value["suit"] + "Card"
  }
  return <div className={["playingCard", colorCode].join(" ")}>{props.value["rank"]}
  </div>
}

// TODO Move wrapping to extra component

function Scoreboard(props) {
  return <Table striped bordered size="sm">
    <thead>
      <th>#</th>
      {view_stub["playersAbbreviated"].map((val, idx) => {
        return <th colSpan="2">{val}</th>
      })}
    </thead>
    <tbody>
      {view_stub["scoreboardTable"].map((val, idx) => {
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

    if (name === view_stub["thisPlayer"]) {
      badges.push(<Badge variant="secondary">You</Badge>)
    }

    if (view_stub["actualTricks"][idx] > 0) {
      badges.push(
        <OverlayTrigger overlay={
          <Tooltip>
            Tricks taken this round
        </Tooltip>
        }>
          <Badge variant="primary">{view_stub["actualTricks"][idx]}</Badge>
        </OverlayTrigger>)
    }

    return <ListGroup.Item>{name} {badges}</ListGroup.Item>

  }

  render() {
    return <ListGroup variant="flush">
      {view_stub["players"].map(this.renderPlayer)}
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
          <PlayingCard value={val}></PlayingCard>
        </Col>
      })}
    </Row>
  </Container>
}

function TrickAnnouncement(props) {
  return <Form>
    <Form.Row>
      <Form.Label>How many tricks do you take?</Form.Label>
      <Form.Control as="select" multiple>
      <option>1</option>
      <option>2</option>
      <option>4</option>
      <option>5</option>
    </Form.Control>
    <Button variant="primary" type="submit">
    Submit
  </Button>
    </Form.Row>
</Form>
}

// class MainGrid extends React.Component {
//   render() {
//     // layout is an array of objects, see the demo for more complete usage
//     const layout = [
//       {i: 'players', x: 0, y: 0, w: 1, h: 1},
//       {i: 'scoreboard', x: 0, y: 1, w: 1, h: 3},
//       {i: 'handcards', x: 1, y: 3, w: 3, h: 1}
//     ];
//     return (
//       <GridLayout className="layout" layout={layout} cols={4} rowHeight={30} width={1200}>
//         <div key="players">
//         <Card>
//             <Card.Header>Players</Card.Header>
//             <PlayerList></PlayerList>
//           </Card>
//         </div>
//         <div key="scoreboard">
//         <Card>
//             <Card.Header>Scoreboard</Card.Header>
//             <Scoreboard></Scoreboard>
//           </Card>
//         </div>
//         <div key="handcards">
//         <Card>
//             <Card.Header>Hand Cards</Card.Header>
//             <Handcards cards={view_stub["hand_cards"]} ></Handcards>
//           </Card>
//         </div>
//       </GridLayout>
//     )
//   }
// }

// function App() {
//   return <MainGrid></MainGrid>
// }

function App() {
  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Header>Scoreboard</Card.Header>
            <Scoreboard></Scoreboard>
          </Card>
        </Col>

        <Col>
          <Container>
            <Row>
              <Col>
                <Card>
                  <Card.Header>Round 2 - Announce</Card.Header>
                  <TrickAnnouncement></TrickAnnouncement>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card>
                  <Card.Header>Table</Card.Header>
                    <TableCards tableCards={view_stub["tableCards"]} tablePlayers={view_stub["tablePlayers"]}></TableCards>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
              <Card>
            <Card.Header>Hand Cards</Card.Header>
            <Handcards cards={view_stub["hand_cards"]} ></Handcards>
          </Card>
              </Col>
            </Row>
          </Container>
        </Col>

        <Col>
          <Card>
            <Card.Header>Players</Card.Header>
            <PlayerList></PlayerList>
            <Button variant="primary">Abort Game</Button>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>

        </Col>
        <Col>
          
        </Col>
      </Row>
    </Container>
  );
}

export default App;
