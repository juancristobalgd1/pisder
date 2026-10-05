"use client";
import { useEffect } from "react";
import { markVisited } from "../useLocal";
export default function MarkVisited({ id }: { id: string }) { useEffect(() => markVisited(id), [id]); return null; }
