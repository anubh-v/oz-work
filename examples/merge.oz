local Merge in
fun {Merge Xs Ys}
  case Xs # Ys
  of nil # Ys then Ys
  [] Xs # nil then Xs
  [] (X|Xr) # (Y|Yr) then
    if X<Y then X | {Merge Xr Ys}
    else Y | {Merge Xs Yr}
    end
  end
end
end
