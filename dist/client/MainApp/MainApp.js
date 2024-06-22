const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React} = Elemento

// MainPage.js
const MainPage_BoardPiecesItem = React.memo(function MainPage_BoardPiecesItem(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item, $itemId, $selected, onClick} = props
    const {ItemSetItem, Icon} = Elemento.components
    const {Floor, If, Or} = Elemento.globalFunctions
    const _state = Elemento.useGetStore()
    const Columns = _state.useObject(parentPathWith('Columns'))
    const Rows = _state.useObject(parentPathWith('Rows'))
    const FromPosition = _state.useObject(parentPathWith('FromPosition'))
    const ToPosition = _state.useObject(parentPathWith('ToPosition'))
    const styles = {left: 'calc(' + ($itemId % Columns) * (100 / Columns) + '% + ' + ($itemId % Columns)* 0 + 'px)', top: 'calc(' + Floor($itemId / Columns) *  (100 / Rows)  + '% + ' + Floor($itemId / Columns)* 0 + 'px)', height: 100 / Rows + '%', width: 100 / Columns + '%', position: 'absolute', border: '1px solid blue', backgroundColor: If(Or($itemId == FromPosition, $itemId == ToPosition), 'orange')}

    return React.createElement(ItemSetItem, {path: props.path, onClick, styles},
        React.createElement(Icon, {path: pathWith('PieceIcon'), iconName: If($item == 'obstacle', 'coronavirus', () => If($item == 'player', 'sentiment_very_satisfied')), styles: {position: 'absolute', top: '50%', left: '50%', translate: '-50% -50%', color: If($item == 'obstacle', 'red', () => If($item == 'player', 'green')), fontSize: '3em', width: '60%', backgroundColor: If($item == 'obstacle', 'yellow'), height: '60%', paddingTop: '0%'}}),
    )
})


function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Calculation, Data, Timer, Button, Block, ItemSet} = Elemento.components
    const {Floor, IsNull, Range, RandomListFrom, RandomFrom, ForEach, If, ListContains, WithUpdates, ItemAt, And, Or, Select} = Elemento.globalFunctions
    const {Set} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const Rows = _state.setObject(pathWith('Rows'), new Calculation.State({value: 8}))
    const Columns = _state.setObject(pathWith('Columns'), new Calculation.State({value: 5}))
    const NumberOfPositions = _state.setObject(pathWith('NumberOfPositions'), new Calculation.State({value: Rows * Columns}))
    const NumberOfObstacles = _state.setObject(pathWith('NumberOfObstacles'), new Calculation.State({value: Floor(NumberOfPositions * 0.5)}))
    const BoardPositions = _state.setObject(pathWith('BoardPositions'), new Data.State({value: []}))
    const PlayerPosition = _state.setObject(pathWith('PlayerPosition'), new Calculation.State({value: BoardPositions.value.indexOf('player')}))
    const HighlightedPosition = _state.setObject(pathWith('HighlightedPosition'), new Data.State({value: null}))
    const PlayerCanMove = _state.setObject(pathWith('PlayerCanMove'), new Calculation.State({value: IsNull(HighlightedPosition)}))
    const FromPosition = _state.setObject(pathWith('FromPosition'), new Data.State({value: null}))
    const ToPosition = _state.setObject(pathWith('ToPosition'), new Data.State({value: null}))
    const Moves = _state.setObject(pathWith('Moves'), new Data.State({value: 0}))
    const MoveTimer2_endAction = React.useCallback(($timer) => {
        Set(FromPosition, null)
        Set(ToPosition, null)
    }, [FromPosition, ToPosition])
    const MoveTimer2 = _state.setObject(pathWith('MoveTimer2'), new Timer.State({period: 1.5, endAction: MoveTimer2_endAction}))
    const Wait = React.useCallback((time) => {
        return new Promise(resolve => setTimeout(resolve, time))
    }, [])
    const StartGame = React.useCallback(() => {
        let lastPosition = NumberOfPositions - 1
        let possibleObstaclePositions = Range(0, lastPosition - Columns)
        let obstaclePositions = RandomListFrom(possibleObstaclePositions, NumberOfObstacles)
        let playerPosition = RandomFrom(Range(NumberOfPositions - Columns, lastPosition))
        let board = ForEach(Range(0, lastPosition), ($item, $index) => If(ListContains(obstaclePositions, $index), 'obstacle', () => If($index == playerPosition, 'player', 'empty')))
        Set(BoardPositions, board)
        return Set(Moves, 0)
    }, [NumberOfPositions, Columns, NumberOfObstacles, BoardPositions, Moves])
    const Move = React.useCallback((fromPosition, toPosition) => {
        let updatedBoard = WithUpdates(BoardPositions, fromPosition.toString(), 'empty', toPosition.toString(), ItemAt(BoardPositions, fromPosition))
        return Set(BoardPositions, updatedBoard)
    }, [BoardPositions])
    const MoveTimer1_endAction = React.useCallback(async ($timer) => {
        await Move(FromPosition, ToPosition)
    }, [Move, FromPosition, ToPosition])
    const MoveTimer1 = _state.setObject(pathWith('MoveTimer1'), new Timer.State({period: 0.7, endAction: MoveTimer1_endAction}))
    const CanMoveTo = React.useCallback((position) => {
        let difference = Math.abs(position - PlayerPosition)
        let newPositionEmpty = ItemAt(BoardPositions, position) == 'empty'
        return And(newPositionEmpty, Or(difference == 1, difference == 5))
    }, [PlayerPosition, BoardPositions])
    const ObstacleMove = React.useCallback((from, to) => {
        Set(FromPosition, from)
        Set(ToPosition, to)
        MoveTimer1.Start()
        return MoveTimer2.Start()
    }, [FromPosition, ToPosition, MoveTimer1, MoveTimer2])
    const RandomPosition = React.useCallback((positionType, excludePosition) => {
        let allPositions = Range(0, NumberOfPositions - 1)
        let possiblePositions = Select(allPositions, ($item, $index) => ItemAt(BoardPositions, $item) == positionType && $item != excludePosition)
        return RandomFrom(possiblePositions)
    }, [NumberOfPositions, BoardPositions])
    const DoPlayerObstacleMove = React.useCallback((position) => {
        ObstacleMove(position, RandomPosition('empty'))
        return Set(Moves, Moves + 5)
    }, [ObstacleMove, RandomPosition, Moves])
    const DoPlayerMove = React.useCallback((position) => {
        Move(PlayerPosition, position)
        ObstacleMove(RandomPosition('obstacle'), RandomPosition('empty', position))
        return Set(Moves, Moves + 1)
    }, [Move, PlayerPosition, ObstacleMove, RandomPosition, Moves])
    const PlayerMove = React.useCallback((position) => {
        If(CanMoveTo(position), () => DoPlayerMove(position))
        return If(ItemAt(BoardPositions, position) == 'obstacle', () => DoPlayerObstacleMove(position))
    }, [CanMoveTo, DoPlayerMove, BoardPositions, DoPlayerObstacleMove])
    const BoardPieces_selectAction = React.useCallback(async ($item, $itemId) => {
        If(PlayerCanMove, async () => await PlayerMove($itemId))
    }, [PlayerCanMove, PlayerMove])
    const BoardPieces = _state.setObject(pathWith('BoardPieces'), new ItemSet.State({items: BoardPositions, selectAction: BoardPieces_selectAction}))
    const Start_action = React.useCallback(async () => {
        await StartGame()
    }, [StartGame])
    const Test_action = React.useCallback(async () => {
        await ObstacleMove()
    }, [ObstacleMove])
    Elemento.elementoDebug(eval(Elemento.useDebugExpr()))

    return React.createElement(Page, {path: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), styles: {fontSize: 24}, content: 'Moving Maze App'}),
        React.createElement(Calculation, {path: pathWith('Rows'), show: false}),
        React.createElement(Calculation, {path: pathWith('Columns'), show: false}),
        React.createElement(Calculation, {path: pathWith('NumberOfPositions'), show: false}),
        React.createElement(Calculation, {path: pathWith('NumberOfObstacles'), show: false}),
        React.createElement(Calculation, {path: pathWith('PlayerPosition'), show: false}),
        React.createElement(Calculation, {path: pathWith('PlayerCanMove'), show: false}),
        React.createElement(Data, {path: pathWith('BoardPositions'), display: false}),
        React.createElement(Data, {path: pathWith('HighlightedPosition'), display: false}),
        React.createElement(Data, {path: pathWith('FromPosition'), display: false}),
        React.createElement(Data, {path: pathWith('ToPosition'), display: false}),
        React.createElement(Data, {path: pathWith('Moves'), display: false}),
        React.createElement(Timer, {path: pathWith('MoveTimer1'), show: false}),
        React.createElement(Timer, {path: pathWith('MoveTimer2'), show: false}),
        React.createElement(Button, {path: pathWith('Start'), content: 'Start', appearance: 'outline', action: Start_action}),
        React.createElement(TextElement, {path: pathWith('Text2'), content: 'Moves: ' + Moves}),
        React.createElement(Button, {path: pathWith('Test'), content: 'Test', appearance: 'outline', show: false, action: Test_action}),
        React.createElement(Block, {path: pathWith('GameBoard'), styles: {maxWidth: '400px', width: '100%', aspectRatio: Columns + ' / ' + Rows, border: '1px solid blue'}},
            React.createElement(ItemSet, {path: pathWith('BoardPieces'), itemContentComponent: MainPage_BoardPiecesItem}),
    ),
    )
}

// appMain.js
export default function MainApp(props) {
    const pathWith = name => 'MainApp' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('MainApp', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'MainApp', },)
}
