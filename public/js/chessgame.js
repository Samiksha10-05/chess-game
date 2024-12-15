// alert('hey');
// const socket =io();  send to backend

// socket.emit("helooo");   emit to send it to all

// socket.on("good morning", function(){      on to on the socket
//     console.log("msg received");
// })

const socket = io();
const chess = new Chess(); // Ensure chess.js library is properly imported

const boardElement = document.querySelector(".chessboard");

let draggedpiece = null;
let sourcesquare = null;
let playerRole = null;

const renderboard = () => {
    const board = chess.board();
    boardElement.innerHTML = ""; // Clear board content

    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareelement = document.createElement("div");
            squareelement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareelement.dataset.row = rowindex;
            squareelement.dataset.col = squareindex;

            if (square) {
                const pieceelement = document.createElement("div");
                pieceelement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceelement.innerText = getpieceunicode(square);
                pieceelement.draggable = playerRole === square.color;

                pieceelement.addEventListener("dragstart", (e) => {
                    if (pieceelement.draggable) {
                        draggedpiece = pieceelement;
                        sourcesquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceelement.addEventListener("dragend", (e) => {
                    draggedpiece = null;
                    sourcesquare = null;
                });

                squareelement.appendChild(pieceelement);
            }

            squareelement.addEventListener("dragover", (e) => e.preventDefault());

            squareelement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedpiece) {
                    const targetSource = {
                        row: parseInt(squareelement.dataset.row),
                        col: parseInt(squareelement.dataset.col),
                    };
                    handlemove(sourcesquare, targetSource);
                }
            });

            boardElement.appendChild(squareelement);
        });
    });

    if(playerRole ==="b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handlemove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q", // Handle pawn promotion (default to queen)
    };
    socket.emit("move", move);
};

const getpieceunicode = (piece) => {
    const unicodepieces = {
        p: "♙", // Black Pawn  ♟
        r: "♜", // Black Rook
        n: "♞", // Black Knight
        b: "♝", // Black Bishop
        q: "♛", // Black Queen
        k: "♚", // Black King
        P: "♙", // White Pawn
        R: "♖", // White Rook
        N: "♘", // White Knight
        B: "♗", // White Bishop
        Q: "♕", // White Queen
        K: "♔", // White King
    };
    return unicodepieces[piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase()] || " ";
};


// Socket event handlers
socket.on("playerRole", (role) => {
    playerRole = role;
    renderboard();
});

socket.on("spectatorrole", () => {
    playerRole = null;
    renderboard();
});

socket.on("boardState", (fen) => {
    try {
        chess.load(fen); // Load board state safely
        renderboard();
    } catch (error) {
        console.error("Error loading board state:", error);
    }
});

socket.on("move", (move) => {
    try {
        chess.move(move); // Process move safely
        renderboard();
    } catch (error) {
        console.error("Error processing move:", error);
    }
});

renderboard();
