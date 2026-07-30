"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface UsernameFormValues {
  readonly username: string;
}

export interface UsernameFormProps {
  readonly isLoading: boolean;
  readonly onSubmit: (values: UsernameFormValues) => void;
}

export function UsernameForm({ isLoading, onSubmit }: UsernameFormProps) {
  const [username, setUsername] = useState("");

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ username });
      }}
    >
      <label className="flex-1 text-sm sm:max-w-sm">
        <span className="mb-1 block text-muted-foreground">GitHub username</span>
        <Input
          className="font-mono"
          placeholder="torvalds"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          required
        />
      </label>

      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {isLoading ? "Fetching…" : "Export stars"}
      </Button>
    </form>
  );
}
