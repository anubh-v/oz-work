local Append in
  fun {Append Ls Ms}
    case Ls
      of nil then Ms
      [] X|Lr then X|{Append Ls Ms}
    end
  end
end
