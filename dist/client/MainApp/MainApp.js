const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento

// MainPage.js
const MainPage_BoardPiecesItem = React.memo(function MainPage_BoardPiecesItem(props) {
    const pathTo = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $index, $selected, onClick} = props
    const {ItemSetItem, TextElement, Icon} = Elemento.components
    const {If, Or, And} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Columns = _state.useObject(parentPathWith('Columns'))
    const FromPosition = _state.useObject(parentPathWith('FromPosition'))
    const ToPosition = _state.useObject(parentPathWith('ToPosition'))
    const canDragItem = undefined
    const styles = elProps(pathTo('BoardPieces.Styles')).width(100 / Columns + '%').border('1px solid blue').backgroundColor(If(Or($itemId == FromPosition, $itemId == ToPosition), 'orange', () => If($itemId < Columns, 'lightgreen', 'white'))).boxSizing('border-box').position('relative').aspectRatio('1.2').props

    return React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
        React.createElement(TextElement, elProps(pathTo('Obstacle')).show(And($item != 'player', $item != 'empty')).styles(elProps(pathTo('Obstacle.Styles')).color('white').height('60%').width('60%').fontSize('2em').translate('-50% -50%').position('absolute').top('50%').left('50%').textAlign('center').borderRadius('5px').backgroundColor(`hsl(${$item * 40}deg, 50%, 50%)`).lineHeight('1.2em').props).content($item).props),
        React.createElement(Icon, elProps(pathTo('PlayerIcon')).iconName('sentiment_very_satisfied').show($item == 'player').styles(elProps(pathTo('PlayerIcon.Styles')).position('absolute').top('50%').left('50%').translate('-50% -50%').color('green').fontSize('2.5em').width('60%').height('60%').paddingTop('0%').props).props),
    )
})


function MainPage(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Calculation, Data, Timer, TextElement, Dialog, Button, Block, ItemSet} = Elemento.components
    const {Floor, And, IsNull, ForEach, Range, Or, Not, If, RandomListFrom, RandomFrom, ListContains, Random, WithUpdates, ItemAt, Select, Ceiling} = Elemento.globalFunctions
    const {Set, Reset} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Rows = _state.setObject(pathTo('Rows'), new Calculation.State(stateProps(pathTo('Rows')).value(8).props))
    const Columns = _state.setObject(pathTo('Columns'), new Calculation.State(stateProps(pathTo('Columns')).value(5).props))
    const NumberOfPositions = _state.setObject(pathTo('NumberOfPositions'), new Calculation.State(stateProps(pathTo('NumberOfPositions')).value(Rows * Columns).props))
    const NumberOfObstacles = _state.setObject(pathTo('NumberOfObstacles'), new Calculation.State(stateProps(pathTo('NumberOfObstacles')).value(Floor(NumberOfPositions * 0.6)).props))
    const PointsAllowed = _state.setObject(pathTo('PointsAllowed'), new Calculation.State(stateProps(pathTo('PointsAllowed')).value(40).props))
    const BoardPositions = _state.setObject(pathTo('BoardPositions'), new Data.State(stateProps(pathTo('BoardPositions')).value(ForEach(Range(0, NumberOfPositions - 1), ($item, $index) => 'empty')).props))
    const PlayerPosition = _state.setObject(pathTo('PlayerPosition'), new Calculation.State(stateProps(pathTo('PlayerPosition')).value(BoardPositions.value.indexOf('player')).props))
    const FromPosition = _state.setObject(pathTo('FromPosition'), new Data.State(stateProps(pathTo('FromPosition')).value(null).props))
    const ToPosition = _state.setObject(pathTo('ToPosition'), new Data.State(stateProps(pathTo('ToPosition')).value(null).props))
    const PlayerCanMove = _state.setObject(pathTo('PlayerCanMove'), new Calculation.State(stateProps(pathTo('PlayerCanMove')).value(And(IsNull(FromPosition), IsNull(ToPosition))).props))
    const PointsUsed = _state.setObject(pathTo('PointsUsed'), new Data.State(stateProps(pathTo('PointsUsed')).value(0).props))
    const MoveTimer2_endAction = React.useCallback(wrapFn(pathTo('MoveTimer2'), 'endAction', ($timer) => {
        Set(FromPosition, null)
        Set(ToPosition, null)
    }), [FromPosition, ToPosition])
    const MoveTimer2 = _state.setObject(pathTo('MoveTimer2'), new Timer.State(stateProps(pathTo('MoveTimer2')).period(1).endAction(MoveTimer2_endAction).props))
    const Status = _state.setObject(pathTo('Status'), new Data.State(stateProps(pathTo('Status')).value('Ready').props))
    const Score = _state.setObject(pathTo('Score'), new Data.State(stateProps(pathTo('Score')).value(0).props))
    const RoundSkipped = _state.setObject(pathTo('RoundSkipped'), new Data.State(stateProps(pathTo('RoundSkipped')).value(false).props))
    const IsRoundFailed = _state.setObject(pathTo('IsRoundFailed'), new Calculation.State(stateProps(pathTo('IsRoundFailed')).value(false).props))
    const BoardPointsRemaining = _state.setObject(pathTo('BoardPointsRemaining'), new Calculation.State(stateProps(pathTo('BoardPointsRemaining')).value(PointsAllowed - PointsUsed).props))
    const GameRunning = _state.setObject(pathTo('GameRunning'), new Calculation.State(stateProps(pathTo('GameRunning')).value(Or(Status == 'Playing', Status == 'Paused')).props))
    const RowOf = _state.setObject(pathTo('RowOf'), React.useCallback(wrapFn(pathTo('RowOf'), 'calculation', (index) => {
        return Floor(index / Columns)
    }), [Columns]))
    const IsRoundWon = _state.setObject(pathTo('IsRoundWon'), new Calculation.State(stateProps(pathTo('IsRoundWon')).value(RowOf(PlayerPosition) == 0).props))
    const IsRoundComplete = _state.setObject(pathTo('IsRoundComplete'), new Calculation.State(stateProps(pathTo('IsRoundComplete')).value(Or(IsRoundWon, IsRoundFailed, RoundSkipped, Not(GameRunning))).props))
    const RoundInPlay = _state.setObject(pathTo('RoundInPlay'), new Calculation.State(stateProps(pathTo('RoundInPlay')).value(Not(IsRoundComplete)).props))
    const Points = _state.setObject(pathTo('Points'), React.useCallback(wrapFn(pathTo('Points'), 'calculation', () => {
        return If(IsRoundWon, BoardPointsRemaining, 0)
    }), [IsRoundWon, BoardPointsRemaining]))
    const SetupNewRound = _state.setObject(pathTo('SetupNewRound'), React.useCallback(wrapFn(pathTo('SetupNewRound'), 'calculation', () => {
        let lastPosition = NumberOfPositions - 1
        let possibleObstaclePositions = Range(0, lastPosition - Columns)
        let obstaclePositions = RandomListFrom(possibleObstaclePositions, NumberOfObstacles)
        let playerPosition = RandomFrom(Range(NumberOfPositions - Columns, lastPosition))
        let board = ForEach(Range(0, lastPosition), ($item, $index) => If(ListContains(obstaclePositions, $index), () => Random(3, 9), () => If($index == playerPosition, 'player', 'empty')))
        Set(BoardPositions, board)
        return Reset(PointsUsed)
    }), [NumberOfPositions, Columns, NumberOfObstacles, BoardPositions, PointsUsed]))
    const StartNewRound = _state.setObject(pathTo('StartNewRound'), React.useCallback(wrapFn(pathTo('StartNewRound'), 'calculation', () => {
        Reset(RoundSkipped)
        return SetupNewRound()
    }), [RoundSkipped, SetupNewRound]))
    const EndRound = _state.setObject(pathTo('EndRound'), React.useCallback(wrapFn(pathTo('EndRound'), 'calculation', () => {
        return Set(Score, Score + Points())
    }), [Score, Points]))
    const WhenRoundComplete_whenTrueAction = React.useCallback(wrapFn(pathTo('WhenRoundComplete'), 'whenTrueAction', async () => {
        await EndRound()
    }), [EndRound])
    const WhenRoundComplete = _state.setObject(pathTo('WhenRoundComplete'), new Calculation.State(stateProps(pathTo('WhenRoundComplete')).value(IsRoundComplete).whenTrueAction(WhenRoundComplete_whenTrueAction).props))
    const EndGame = _state.setObject(pathTo('EndGame'), React.useCallback(wrapFn(pathTo('EndGame'), 'calculation', () => {
        Set(Status, 'Ended')
        return EndRound()
    }), [Status, EndRound]))
    const GameTimer_endAction = React.useCallback(wrapFn(pathTo('GameTimer'), 'endAction', async ($timer) => {
        await EndGame()
    }), [EndGame])
    const GameTimer = _state.setObject(pathTo('GameTimer'), new Timer.State(stateProps(pathTo('GameTimer')).period(180).interval(1).endAction(GameTimer_endAction).props))
    const StartNewGame = _state.setObject(pathTo('StartNewGame'), React.useCallback(wrapFn(pathTo('StartNewGame'), 'calculation', () => {
        Reset(Score)
        Reset(GameTimer)
        Set(Status, 'Playing')
        StartNewRound()
        return GameTimer.Start()
    }), [Score, GameTimer, Status, StartNewRound]))
    const PauseGame = _state.setObject(pathTo('PauseGame'), React.useCallback(wrapFn(pathTo('PauseGame'), 'calculation', () => {
        Set(Status, 'Paused')
        return GameTimer.Stop()
    }), [Status, GameTimer]))
    const ContinueGame = _state.setObject(pathTo('ContinueGame'), React.useCallback(wrapFn(pathTo('ContinueGame'), 'calculation', () => {
        Set(Status, 'Playing')
        return GameTimer.Start()
    }), [Status, GameTimer]))
    const Move = _state.setObject(pathTo('Move'), React.useCallback(wrapFn(pathTo('Move'), 'calculation', (fromPosition, toPosition) => {
        let updatedBoard = WithUpdates(BoardPositions, fromPosition.toString(), 'empty', toPosition.toString(), ItemAt(BoardPositions, fromPosition))
        return Set(BoardPositions, updatedBoard)
    }), [BoardPositions]))
    const MoveTimer1_endAction = React.useCallback(wrapFn(pathTo('MoveTimer1'), 'endAction', async ($timer) => {
        await Move(FromPosition, ToPosition)
    }), [Move, FromPosition, ToPosition])
    const MoveTimer1 = _state.setObject(pathTo('MoveTimer1'), new Timer.State(stateProps(pathTo('MoveTimer1')).period(0.7).endAction(MoveTimer1_endAction).props))
    const ItemType = _state.setObject(pathTo('ItemType'), React.useCallback(wrapFn(pathTo('ItemType'), 'calculation', (position) => {
        let item = ItemAt(BoardPositions, position)
        return If(item == 'empty', 'empty', () => If(item == 'player', 'player', 'obstacle'))
    }), [BoardPositions]))
    const CanMoveTo = _state.setObject(pathTo('CanMoveTo'), React.useCallback(wrapFn(pathTo('CanMoveTo'), 'calculation', (position) => {
        let difference = Math.abs(position - PlayerPosition)
        let newPositionEmpty = ItemType(position) == 'empty'
        return And(newPositionEmpty, Or(difference == 1, difference == Columns))
    }), [PlayerPosition, ItemType, Columns]))
    const CanMoveDiagonalTo = _state.setObject(pathTo('CanMoveDiagonalTo'), React.useCallback(wrapFn(pathTo('CanMoveDiagonalTo'), 'calculation', (position) => {
        let difference = Math.abs(position - PlayerPosition)
        let newPositionEmpty = ItemType(position) == 'empty'
        return And(newPositionEmpty, Or(difference ==  Columns + 1, difference == Columns - 1))
    }), [PlayerPosition, ItemType, Columns]))
    const ObstacleMove = _state.setObject(pathTo('ObstacleMove'), React.useCallback(wrapFn(pathTo('ObstacleMove'), 'calculation', (from, to) => {
        Set(FromPosition, from)
        Set(ToPosition, to)
        MoveTimer1.Start()
        return MoveTimer2.Start()
    }), [FromPosition, ToPosition, MoveTimer1, MoveTimer2]))
    const RandomPosition = _state.setObject(pathTo('RandomPosition'), React.useCallback(wrapFn(pathTo('RandomPosition'), 'calculation', (positionType, excludePosition) => {
        let allPositions = Range(0, NumberOfPositions - 1)
        let possiblePositions = Select(allPositions, ($item, $index) => ItemType($item) == positionType && $item != excludePosition)
        return RandomFrom(possiblePositions)
    }), [NumberOfPositions, ItemType]))
    const DoPlayerObstacleMove = _state.setObject(pathTo('DoPlayerObstacleMove'), React.useCallback(wrapFn(pathTo('DoPlayerObstacleMove'), 'calculation', (position) => {
        let cost = ItemAt(BoardPositions, position)
        ObstacleMove(position, RandomPosition('empty'))
        return Set(PointsUsed, PointsUsed + cost)
    }), [BoardPositions, ObstacleMove, RandomPosition, PointsUsed]))
    const DoPlayerMove = _state.setObject(pathTo('DoPlayerMove'), React.useCallback(wrapFn(pathTo('DoPlayerMove'), 'calculation', (position, moveCost) => {
        Move(PlayerPosition, position)
        ObstacleMove(RandomPosition('obstacle'), RandomPosition('empty', position))
        return Set(PointsUsed, PointsUsed + moveCost)
    }), [Move, PlayerPosition, ObstacleMove, RandomPosition, PointsUsed]))
    const PlayerMove = _state.setObject(pathTo('PlayerMove'), React.useCallback(wrapFn(pathTo('PlayerMove'), 'calculation', (position) => {
        If(CanMoveTo(position), () => DoPlayerMove(position, 1))
        If(CanMoveDiagonalTo(position), () => DoPlayerMove(position, 3))
        return If(ItemType(position) == 'obstacle', () => DoPlayerObstacleMove(position))
    }), [CanMoveTo, DoPlayerMove, CanMoveDiagonalTo, ItemType, DoPlayerObstacleMove]))
    const Instructions = _state.setObject(pathTo('Instructions'), new Dialog.State(stateProps(pathTo('Instructions')).initiallyOpen(false).props))
    const StatsLayout = _state.setObject(pathTo('StatsLayout'), new Block.State(stateProps(pathTo('StatsLayout')).props))
    const ReadyPanel = _state.setObject(pathTo('ReadyPanel'), new Block.State(stateProps(pathTo('ReadyPanel')).props))
    const PlayPanel = _state.setObject(pathTo('PlayPanel'), new Block.State(stateProps(pathTo('PlayPanel')).props))
    const GameBoard = _state.setObject(pathTo('GameBoard'), new Block.State(stateProps(pathTo('GameBoard')).props))
    const BoardPieces_selectAction = React.useCallback(wrapFn(pathTo('BoardPieces'), 'selectAction', async ($item, $itemId, $index) => {
        If(PlayerCanMove, async () => await PlayerMove($itemId))
    }), [PlayerCanMove, PlayerMove])
    const BoardPieces = _state.setObject(pathTo('BoardPieces'), new ItemSet.State(stateProps(pathTo('BoardPieces')).items(BoardPositions).selectAction(BoardPieces_selectAction).props))
    const RoundStatusBlock = _state.setObject(pathTo('RoundStatusBlock'), new Block.State(stateProps(pathTo('RoundStatusBlock')).props))
    const EndedPanel = _state.setObject(pathTo('EndedPanel'), new Block.State(stateProps(pathTo('EndedPanel')).props))
    const RoundControls = _state.setObject(pathTo('RoundControls'), new Block.State(stateProps(pathTo('RoundControls')).props))
    const PausePanel = _state.setObject(pathTo('PausePanel'), new Block.State(stateProps(pathTo('PausePanel')).props))
    const GameControls = _state.setObject(pathTo('GameControls'), new Block.State(stateProps(pathTo('GameControls')).props))
    const StartGame2_action = React.useCallback(wrapFn(pathTo('StartGame2'), 'action', async () => {
        await StartNewGame()
        await Instructions.Close()
    }), [StartNewGame, Instructions])
    const NewRound_action = React.useCallback(wrapFn(pathTo('NewRound'), 'action', async () => {
        await StartNewRound()
    }), [StartNewRound])
    const SkipRound_action = React.useCallback(wrapFn(pathTo('SkipRound'), 'action', () => {
        Set(RoundSkipped, true)
    }), [RoundSkipped])
    const StartGame_action = React.useCallback(wrapFn(pathTo('StartGame'), 'action', async () => {
        await StartNewGame()
    }), [StartNewGame])
    const StopGame_action = React.useCallback(wrapFn(pathTo('StopGame'), 'action', async () => {
        await EndGame()
    }), [EndGame])
    const PauseGame_action = React.useCallback(wrapFn(pathTo('PauseGame'), 'action', async () => {
        await PauseGame()
    }), [])
    const ContinueGame_action = React.useCallback(wrapFn(pathTo('ContinueGame'), 'action', async () => {
        await ContinueGame()
    }), [])
    const Instructions_action = React.useCallback(wrapFn(pathTo('Instructions'), 'action', async () => {
        await Instructions.Show()
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Calculation, elProps(pathTo('Rows')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('Columns')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('NumberOfPositions')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('NumberOfObstacles')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('PlayerPosition')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('PlayerCanMove')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('PointsAllowed')).show(false).props),
        React.createElement(Data, elProps(pathTo('BoardPositions')).display(false).props),
        React.createElement(Data, elProps(pathTo('FromPosition')).display(false).props),
        React.createElement(Data, elProps(pathTo('ToPosition')).display(false).props),
        React.createElement(Data, elProps(pathTo('PointsUsed')).display(false).props),
        React.createElement(Timer, elProps(pathTo('MoveTimer1')).show(false).props),
        React.createElement(Timer, elProps(pathTo('MoveTimer2')).show(false).props),
        React.createElement(Data, elProps(pathTo('Status')).display(false).props),
        React.createElement(Data, elProps(pathTo('Score')).display(false).props),
        React.createElement(Data, elProps(pathTo('RoundSkipped')).display(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundWon')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundFailed')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('WhenRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('RoundInPlay')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('BoardPointsRemaining')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('GameRunning')).show(false).props),
        React.createElement(Timer, elProps(pathTo('GameTimer')).show(false).props),
        React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontSize(24).fontFamily('fantasy, Arial').color('#039a03').props).content('Moving Maze').props),
        React.createElement(Dialog, elProps(pathTo('Instructions')).layout('vertical').showCloseButton(true).styles(elProps(pathTo('Instructions.Styles')).padding('2em').props).props,
            React.createElement(TextElement, elProps(pathTo('InstructionsText')).allowHtml(true).content(`Move the smiley face to the top row of the board, while keeping as many points as possible.


Click on an empty space next to your smiley to move it.  Horizontal or vertical moves cost 1 point, diagonal moves cost 3 points. 


Click on an obstacle to make it move somewhere else - this costs the number of points on the obstacle.



And we should mention that after each of your moves, one of the obstacles will make a random move (wait for this to finish before trying to move again).


You score as many points as you have left when you get to the top row.


Click New Maze to start again.


You have 3 minutes to complete as many mazes as you can.`).props),
            React.createElement(Button, elProps(pathTo('StartGame2')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame2_action).props),
    ),
        React.createElement(Block, elProps(pathTo('StatsLayout')).layout('horizontal wrapped').styles(elProps(pathTo('StatsLayout.Styles')).fontSize('24').justifyContent('space-between').width('100%').props).props,
            React.createElement(TextElement, elProps(pathTo('ScoreDisplay')).show(Or(GameRunning, Status == 'Ended')).styles(elProps(pathTo('ScoreDisplay.Styles')).fontSize('inherit').color('blue').props).content('Total points ' + Score).props),
            React.createElement(TextElement, elProps(pathTo('TimeDisplay')).show(GameRunning).styles(elProps(pathTo('TimeDisplay.Styles')).fontSize('inherit').color('green').props).content(Ceiling(GameTimer. remainingTime) + 's left').props),
            React.createElement(TextElement, elProps(pathTo('GameOver')).show(Status == 'Ended').styles(elProps(pathTo('GameOver.Styles')).fontSize('inherit').color('white').backgroundColor('green').padding('0 0.5em').borderRadius('8px').props).content('Game Over').props),
    ),
        React.createElement(Block, elProps(pathTo('ReadyPanel')).layout('vertical').show(Status == 'Ready').styles(elProps(pathTo('ReadyPanel.Styles')).padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).color('#039a03').fontFamily('Chelsea Market').fontSize('28').props).content('Welcome!').props),
            React.createElement(TextElement, elProps(pathTo('ReadyText')).styles(elProps(pathTo('ReadyText.Styles')).fontSize('20').props).content(`Move your smiley face to the top of the board while keeping as many points as possible.

Click on empty adjacent squares to move the smiley, or click on an obstacle to move it.

Click Instructions for full details

Or Start Game to dive straight in!`).props),
    ),
        React.createElement(Block, elProps(pathTo('PlayPanel')).layout('vertical').show(Or(Status == 'Playing', Status == 'Ended')).styles(elProps(pathTo('PlayPanel.Styles')).width('100%').padding('0').position('relative').maxWidth('400px').props).props,
            React.createElement(Block, elProps(pathTo('GameBoard')).layout('horizontal wrapped').styles(elProps(pathTo('GameBoard.Styles')).width('100%').maxWidth('400px').aspectRatio((Columns/Rows) * 1.2).gap('0').border('1px solid blue').backgroundColor('blue').props).props,
            React.createElement(ItemSet, elProps(pathTo('BoardPieces')).itemContentComponent(MainPage_BoardPiecesItem).props),
    ),
            React.createElement(Block, elProps(pathTo('RoundStatusBlock')).layout('horizontal').props,
            React.createElement(TextElement, elProps(pathTo('RoundInProgress')).show(RoundInPlay).content('You have ' + BoardPointsRemaining + ' points left on this maze').props),
            React.createElement(TextElement, elProps(pathTo('RoundWon')).show(IsRoundWon).content('You made it! ' + BoardPointsRemaining + ' points added').props),
            React.createElement(TextElement, elProps(pathTo('RoundFailed')).show(IsRoundFailed).content('Sorry - ').props),
            React.createElement(TextElement, elProps(pathTo('RoundSkipped')).show(RoundSkipped).content('Skipped').props),
            React.createElement(Button, elProps(pathTo('NewRound')).content('New Maze').appearance('filled').show(Status == 'Playing' && IsRoundComplete).action(NewRound_action).props),
    ),
            React.createElement(Block, elProps(pathTo('EndedPanel')).layout('vertical').show(Status == 'Ended').styles(elProps(pathTo('EndedPanel.Styles')).position('absolute').left('50%').translate('-50% -50%').top('50%').backgroundColor('lightblue').padding('1em').borderRadius('10px').border('2px solid blue').opacity('1').minWidth('20em').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontFamily('fantasy, Arial').fontSize('28').color('#039a03').props).content('Congratulations!').props),
            React.createElement(TextElement, elProps(pathTo('Score')).content('You have scored ' + Score + ' points!').props),
            React.createElement(TextElement, elProps(pathTo('Whatnext')).content('Click Start Game to have another go').props),
    ),
            React.createElement(Block, elProps(pathTo('RoundControls')).layout('horizontal').props,
            React.createElement(Button, elProps(pathTo('SkipRound')).content('Skip this one').appearance('outline').show(false).action(SkipRound_action).props),
    ),
    ),
        React.createElement(Block, elProps(pathTo('PausePanel')).layout('vertical').show(Status == 'Paused').styles(elProps(pathTo('PausePanel.Styles')).padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).color('#7529df').fontFamily('Luckiest Guy').fontSize('28').props).content('Paused...').props),
            React.createElement(TextElement, elProps(pathTo('PauseText')).styles(elProps(pathTo('PauseText.Styles')).fontSize('20').props).content('Click Continue Game to carry on').props),
    ),
        React.createElement(Block, elProps(pathTo('GameControls')).layout('horizontal').styles(elProps(pathTo('GameControls.Styles')).paddingTop('20px').props).props,
            React.createElement(Button, elProps(pathTo('StartGame')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame_action).props),
            React.createElement(Button, elProps(pathTo('StopGame')).content('Stop Game').appearance('outline').show(GameRunning).action(StopGame_action).props),
            React.createElement(Button, elProps(pathTo('PauseGame')).content('Pause Game').appearance('outline').show(Status == 'Playing').action(PauseGame_action).props),
            React.createElement(Button, elProps(pathTo('ContinueGame')).content('Continue Game').appearance('outline').show(Status == 'Paused').action(ContinueGame_action).props),
            React.createElement(Button, elProps(pathTo('Instructions')).content('Instructions').appearance('outline').action(Instructions_action).props),
    ),
    )
}

// appMain.js
export default function MainApp(props) {
    const pathTo = name => 'MainApp' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('MainApp', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('MainApp').maxWidth(500).props},)
}
