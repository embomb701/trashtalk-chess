'use strict';

importScripts('./chess.min.js');

self.addEventListener('message', event => {
  const { id, fen, level, pieceValues, pst, inf } = event.data;
  try {
    const chess = new Chess(fen);
    const move = getBestMove(chess, level, pieceValues, pst, inf);
    self.postMessage({
      id,
      move: move ? { from: move.from, to: move.to, promotion: move.promotion || undefined } : null
    });
  } catch (error) {
    self.postMessage({ id, error: error.message || 'AI worker failed.' });
  }
});

function getBestMove(chess, level, pieceValues, pst, inf) {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;
  if (level === 1) return moves[Math.floor(Math.random() * moves.length)];

  const depth = level <= 2 ? 1 : level <= 4 ? 2 : level <= 6 ? 3 : level <= 8 ? 4 : 5;
  const randomness = level <= 2 ? 0.6 : level <= 4 ? 0.35 : level <= 6 ? 0.16 : level <= 8 ? 0.06 : 0;
  let bestScore = -inf;
  let bestMoves = [];
  const ordered = orderMoves(moves, pieceValues);

  for (const move of ordered) {
    chess.move(move);
    const score = search(chess, depth - 1, -inf, inf, false, pieceValues, pst, inf);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  if (Math.random() < randomness) {
    const top = ordered.slice(0, Math.min(4, ordered.length));
    return top[Math.floor(Math.random() * top.length)];
  }
  const pool = bestMoves.length ? bestMoves : ordered;
  return pool[Math.floor(Math.random() * pool.length)];
}

function search(chess, depth, alpha, beta, maximizingBlack, pieceValues, pst, inf) {
  if (depth === 0 || chess.game_over()) return evaluate(chess, pieceValues, pst, inf);
  const moves = orderMoves(chess.moves({ verbose: true }), pieceValues);
  if (maximizingBlack) {
    let best = -inf;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, search(chess, depth - 1, alpha, beta, false, pieceValues, pst, inf));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = inf;
  for (const move of moves) {
    chess.move(move);
    best = Math.min(best, search(chess, depth - 1, alpha, beta, true, pieceValues, pst, inf));
    chess.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function orderMoves(moves, pieceValues) {
  return moves.slice().sort((a, b) => moveScore(b, pieceValues) - moveScore(a, pieceValues));
}

function moveScore(move, pieceValues) {
  let score = 0;
  if (move.captured) score += 10 * pieceValues[move.captured] - pieceValues[move.piece];
  if (move.promotion) score += pieceValues[move.promotion] + 500;
  if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) score += 35;
  if (move.san.includes('+')) score += 40;
  if (move.san.includes('#')) score += 10000;
  return score;
}

function evaluate(chess, pieceValues, pst, inf) {
  if (chess.in_checkmate()) return chess.turn() === 'w' ? inf - 1 : -inf + 1;
  if (chess.in_stalemate() || chess.in_draw() || chess.insufficient_material() || chess.in_threefold_repetition()) return 0;

  let total = 0;
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const index = row * 8 + col;
      const mirrored = (7 - Math.floor(index / 8)) * 8 + (index % 8);
      const positional = piece.color === 'w' ? pst[piece.type][index] : pst[piece.type][mirrored];
      const value = pieceValues[piece.type] + positional;
      total += piece.color === 'b' ? value : -value;
    }
  }
  const mobility = chess.moves().length;
  total += chess.turn() === 'b' ? mobility : -mobility;
  return total;
}
