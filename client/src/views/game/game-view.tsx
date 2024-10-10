import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Circle, CopySimple, User } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Board, Message, SelectedPiece } from "./interfaces";
import { AppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import { useNavigate } from "react-router-dom";

const GameView = () => {
  const [board, setBoard] = useState<Board[][]>([]);
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(
    null
  );
  const { userInfo, typeUser, startGame, movement } = AppStore();
  const socket = useSocket();
  const navigate = useNavigate();
  const [turn, setTurn] = useState<boolean>(false);
  // const [playersList, setPlayersList] = useState<User[]>([]);
  const { toast } = useToast();
  const path = window.location.pathname.replace(/\s|\//g, "");

  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [userInfo]);

  useEffect(() => {
    createBoard();
  }, []);

  useEffect(() => {
    if (typeUser === "PRIMARY") setTurn(true);
  }, [typeUser]);

  useEffect(() => {
    if (startGame) {
      toast({
        title: "Que comece os Jogos ♟️",
        duration: 1500,
        variant: "destructive",
      });
    }
  }, [startGame]);

  const createBoard = () => {
    const newBoard: Board[][] = [];

    for (let row = 0; row < 8; row++) {
      const newRow: Board[] = [];

      for (let column = 0; column < 8; column++) {
        const square: Board = {
          color: (row + column) % 2 === 0 ? "bg-white" : "bg-black",
          piece: { type: null },
          x: row,
          y: column,
        };
        if (row <= 2 && (row + column) % 2 === 1) {
          square.piece = { type: "pawn", color: "text-orange-200" };
        } else if (row >= 5 && (row + column) % 2 === 1) {
          square.piece = { type: "pawn", color: "text-amber-800" };
        }
        newRow.push(square);
      }
      newBoard.push(newRow);
    }
    setBoard(newBoard);
  };

  const selectPiece = (
    rowIndex: number,
    columnIndex: number,
    selectedPiece: SelectedPiece | null,
    messageReceived?: boolean
  ) => {
    if (typeUser === "VISITOR") return;
    if (selectedPiece) {
      const isValidMove = validateMove(rowIndex, columnIndex, selectedPiece);
      if (isValidMove.valid) {
        const move = isValidMove?.x ? isValidMove : undefined;
        const board = movePawn(rowIndex, columnIndex, move, selectedPiece);
        if (board) {
          setBoard(board);
          !messageReceived &&
            sendMessage({
              x: rowIndex,
              y: columnIndex,
              oldX: selectedPiece.oldX,
              oldY: selectedPiece.oldY,
            });
        }
      }
      return setSelectedPiece(null);
    } else {
      const colorPiece = board[rowIndex][columnIndex].piece?.color;
      if (colorPiece === "text-amber-800" && typeUser === "SECUNDARY") return;
      if (colorPiece === "text-orange-200" && typeUser === "PRIMARY") return;
      setSelectedPiece({
        x: rowIndex,
        y: columnIndex,
        oldX: rowIndex,
        oldY: columnIndex,
      });
    }
  };

  function validateMove(
    newX: number,
    newY: number,
    selectedPiece: SelectedPiece | null
  ) {
    if (
      board[newX][newY].color === "bg-white" ||
      (selectedPiece &&
        board[selectedPiece?.x][selectedPiece?.y].color === "bg-black" &&
        !board[selectedPiece?.x][selectedPiece?.y].piece?.type)
    )
      return { valid: false };
    if (board[newX][newY].piece?.type === "pawn") return { valid: false };
    const adjacentMove = validateAdjacentMove(
      newX,
      newY,
      selectedPiece?.x,
      selectedPiece?.y
    );
    if (adjacentMove === "noValid") return { valid: false };
    if (adjacentMove === "eat") {
      const pawnBetween = verifyPawnBetweenPieces(
        board,
        [selectedPiece?.x, selectedPiece?.y],
        [newX, newY]
      );
      return pawnBetween;
    }
    return { valid: true };
  }

  function validateAdjacentMove(
    fromRow: number,
    fromCol: number,
    toRow: number | undefined,
    toCol: number | undefined
  ): string {
    if (toRow != undefined && toCol != undefined) {
      const deltaRow = toRow - fromRow;
      const deltaCol = toCol - fromCol;

      if (Math.abs(deltaRow) !== Math.abs(deltaCol)) {
        return "noValid";
      }

      const distance = Math.abs(deltaRow);
      if (distance === 2) return "eat";
      if (distance === 1) return "move";
    }
    return "noValid";
  }

  const verifyPawnBetweenPieces = (
    board: Board[][],
    start: [number | undefined, number | undefined],
    end: [number, number]
  ): { valid: boolean; x?: number; y?: number } => {
    if (start[0] != undefined && start[1] != undefined) {
      const oldSquare = board[start[0]][start[1]];
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const stepX = dx / Math.abs(dx);
      const stepY = dy / Math.abs(dy);

      let betweenX = start[0] + stepX;
      let betweenY = start[1] + stepY;

      while (betweenX !== end[0] && betweenY !== end[1]) {
        const square = board[betweenX][betweenY];

        if (
          square.piece?.type !== null &&
          square.piece?.color !== oldSquare.piece?.color
        ) {
          return { valid: true, x: betweenX, y: betweenY };
        }

        betweenX += stepX;
        betweenY += stepY;
      }
    }
    return { valid: false };
  };

  const movePawn = (
    newX: number,
    newY: number,
    eat: { valid: boolean; x?: number; y?: number } | undefined,
    selectedPiece: SelectedPiece
  ) => {
    const newBoard = [...board];
    if (selectedPiece) {
      newBoard[newX][newY].piece =
        newBoard[selectedPiece.x][selectedPiece.y].piece;
      newBoard[selectedPiece.x][selectedPiece.y].piece = { type: null };
      if (eat?.x && eat?.y) {
        newBoard[eat.x][eat.y].piece = { type: null };
      }
      return newBoard;
    }
  };

  async function sendMessage(selectedPiece: SelectedPiece) {
    if (!userInfo) return;
    const message: Message = {
      userId: userInfo.userId,
      name: userInfo.userName,
      x: selectedPiece.x,
      y: selectedPiece.y,
      oldX: selectedPiece.oldX,
      oldY: selectedPiece.oldY,
      roomId: path,
    };
    socket?.emit("emitMovePiece", message);
    setTurn(false);
  }

  useEffect(() => {
    if (movement && "oldX" in movement) {
      if (typeUser !== "VISITOR") {
        setTurn(true);
        toast({
          title: "Seu turno",
          duration: 1000,
        });
      }
      selectPiece(
        movement.x,
        movement.y,
        {
          x: movement.oldX,
          y: movement.oldY,
          oldX: movement.oldX,
          oldY: movement.oldY,
        },
        true
      );
    }
  }, [movement]);

  function startGameMovement(rowIndex: number, columnIndex: number) {
    if (typeUser === "VISITOR") return;
    if (!startGame) {
      return toast({
        title: "Espere seu adversário",
        duration: 1500,
      });
    } else if (turn) selectPiece(rowIndex, columnIndex, selectedPiece);
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-800">
        <div className="fixed flex justify-between items-center h-10 top-5 left-10 right-10 xl:left-1/4 xl:right-1/4 md:left-60 md:right-60 sm:left-10 sm:right-1 text-slate-700">
          <div className="w-1/3 h-full flex items-center rounded-full bg-white p-3">
            <User className="mr-3" weight="fill" />
            <h3>{userInfo?.userName}</h3>
          </div>
        </div>
        <div id="game">
          <table
            className={`flex flex-col justify-center items-center w-min mt-5 m-auto p-3 border rounded-md ${
              typeUser === "PRIMARY" || typeUser === "VISITOR"
                ? "rotate-0"
                : "rotate-180"
            }`}
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => typeUser === "VISITOR" && e.preventDefault()}
          >
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="row flex w-min">
                  {row.map((column, columnIndex) => (
                    <td
                      key={`column-${columnIndex}`}
                      className="column select-none cursor-pointer"
                    >
                      <div
                        className={`square flex w-6 h-6 justify-center items-center ${
                          column.color
                        } ${
                          selectedPiece &&
                          selectedPiece.x === rowIndex &&
                          selectedPiece.y === columnIndex
                            ? "bg-red-600"
                            : ""
                        } hover:bg-gray-600 rounded`}
                        onClick={() => startGameMovement(rowIndex, columnIndex)}
                      >
                        {column.piece?.type === "pawn" && (
                          <Circle
                            weight="fill"
                            className={`${column.piece.color}`}
                          />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Button
        className="fixed bottom-5 left-10 right-10 xl:left-1/4 xl:right-1/4 md:left-60 md:right-60 sm:left-10 sm:right-10 bg-slate-700 hover:bg-slate-900 text-white"
        onClick={() => {
          navigator.clipboard.writeText(path);
          toast({
            description: "Código copiado",
            duration: 1500,
          });
        }}
      >
        <p className="mr-3">{path}</p>
        <CopySimple weight="fill" />
      </Button>
      <Toaster />
    </>
  );
};

export default GameView;
