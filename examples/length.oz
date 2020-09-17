local Length in

fun {Length Ls}
  case Ls
  of nil then 0
  [] _|Lr then 1 + {Length Lr}
  end
end

end
