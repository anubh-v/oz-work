local Sqrt SqrtItr Improve GoodEnough Abs in
fun {Sqrt X}
  Guess=1.0
  in
  {SqrtItr Guess X}
end

fun {SqrtItr Guess X}
  if {GoodEnough Guess X} then Guess
  else
    {SqrtItr {Improve Guess X} X}
  end
end

fun {Improve Guess X}
  (Guess + X/Guess) / 2.0
end

fun {GoodEnough Guess X}
  {Abs X-Guess*Guess}/X < 0.00001
end

fun {Abs X} if X < 0.0 then ~X else X end end

end
