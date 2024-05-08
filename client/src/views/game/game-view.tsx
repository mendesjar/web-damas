import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "../../components/ui/button";
import { Circle, CopySimple } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Board, Message, SelectedPiece } from "./interfaces";
import { SessionService } from "../../services";
import { locales } from "../../resources";

const GameView = () => {
  const [board, setBoard] = useState<Board[][]>([]);
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(
    null
  );
  const [turn, setTurn] = useState<boolean>(true);
  const sessionService = new SessionService();
  const usuario = sessionService.getUsuario();
  const { toast } = useToast();
  const path = window.location.pathname.replace(/\s|\//g, "");
  const connection =
    locales.enviroment == "production"
      ? locales.socketApi
      : `${locales.socketHost}:${locales.socketPort}`;

  const socket = io(connection, {
    transports: ["websocket"],
  });

  useEffect(() => {
    createBoard();
  }, []);

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

  const selectPiece = (rowIndex: number, columnIndex: number) => {
    if (turn) {
      if (selectedPiece) {
        const isValidMove = validateMove(rowIndex, columnIndex);
        if (isValidMove.valid) {
          const move = isValidMove?.x ? isValidMove : undefined;
          movePawn(rowIndex, columnIndex, move);
        } else setSelectedPiece(null);
      } else {
        setSelectedPiece({
          x: rowIndex,
          y: columnIndex,
          oldX: rowIndex,
          oldY: columnIndex,
        });
      }
    } else {
      toast({
        title: "Não é seu turno",
        duration: 1000,
      });
    }
  };

  function validateMove(newX: number, newY: number) {
    if (board[newX][newY].color === "bg-white") return { valid: false };
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
  ) {
    if (toRow && toCol) {
      const deltaRow = toRow - fromRow;
      const deltaCol = toCol - fromCol;

      if (Math.abs(deltaRow) !== Math.abs(deltaCol)) {
        return "noValid";
      }

      const distance = Math.abs(deltaRow);
      if (distance === 2) return "eat";
      if (distance === 1) return "move";
      return "noValid";
    }
  }

  const verifyPawnBetweenPieces = (
    board: Board[][],
    start: [number | undefined, number | undefined],
    end: [number, number]
  ): { valid: boolean; x?: number; y?: number } => {
    if (start[0] && start[1]) {
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
    eat: { valid: boolean; x?: number; y?: number } | undefined
  ) => {
    const newBoard = board;
    if (selectedPiece) {
      newBoard[newX][newY].piece =
        newBoard[selectedPiece.x][selectedPiece.y].piece;
      newBoard[selectedPiece.x][selectedPiece.y].piece = { type: null };
      if (eat?.x && eat?.y) {
        newBoard[eat.x][eat.y].piece = { type: null };
      }
      sendMessage({ ...selectedPiece, oldX: newX, oldY: newY });
    }
    setSelectedPiece(null);
  };

  function sendMessage(selectedPiece: SelectedPiece) {
    const message: Message = {
      id: usuario.id,
      name: usuario.nome,
      x: selectedPiece.x,
      y: selectedPiece.y,
      oldX: selectedPiece.oldX,
      oldY: selectedPiece.oldY,
      path,
      board,
    };
    socket.emit("msgToServer", message);
  }

  useEffect(() => {
    function receivedMenssage(message: Message) {
      setBoard(message.board);
      const turno = usuario.id !== message.id;
      if (turno) {
        toast({
          title: "Seu turno",
          duration: 1000,
        });
      }
      setTurn(turno);
    }
    socket.on(`msgToClient:${path}`, (message: Message) => {
      receivedMenssage(message);
    });
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-800">
        <div id="game">
          <table
            className="flex flex-col justify-center items-center w-min mt-5 m-auto p-3 border rounded-md"
            onContextMenu={(e) => e.preventDefault()}
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
                        onClick={() => selectPiece(rowIndex, columnIndex)}
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
