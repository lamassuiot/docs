# Estilo "bloques" para las grabaciones de las demos (inspirado en Warp).
# Solo se carga en shells interactivas.
[[ $- == *i* ]] || return 0

# --- resaltado de sintaxis mientras se escribe (ble.sh) -------------------
if [[ -r /usr/local/share/blesh/ble.sh ]]; then
  source /usr/local/share/blesh/ble.sh --noattach --rcfile /etc/lamassu-demo.blerc
  # ble.sh imprime "updating tput cache" en la primera carga: borra la pantalla.
  printf '\033[H\033[2J\033[3J'
fi

# --- colores (truecolor) ---------------------------------------------------
__sgr_dim='38;2;93;116;128'
__sgr_rule='38;2;48;48;48'
__sgr_dir='1;38;2;111;177;214'
__sgr_git='38;2;143;213;166'
__sgr_branch='38;2;230;207;151'

# Color para PS1 (\[ \] evitan que cuente para el ancho de línea).
__ps() { printf '\\[\\e[%sm\\]' "$1"; }

__blk_start=
__blk_first=1
__blk_pre() { __blk_start=$EPOCHREALTIME; }

# Mide el tiempo de cada comando.
if [[ ${BLE_VERSION-} ]]; then
  blehook PREEXEC+=__blk_pre
else
  __blk_trap() { [[ -z $__blk_in_prompt && -z $__blk_start ]] && __blk_start=$EPOCHREALTIME; }
  trap '__blk_trap' DEBUG
fi

__blk_prompt() {
  local ec=$?
  __blk_in_prompt=1

  local dur=
  if [[ -n $__blk_start ]]; then
    local s=${__blk_start/./} e=${EPOCHREALTIME/./}
    local us=$(( 10#$e - 10#$s ))
    printf -v dur '%d.%03d' $(( us / 1000000 )) $(( (us / 1000) % 1000 ))
    __blk_start=
  fi

  # Separador de bloque (ancho completo), salvo en el primer prompt.
  if [[ -z $__blk_first ]]; then
    local rule
    printf -v rule '%*s' "${COLUMNS:-80}" ''
    printf '\n\e[%sm%s\e[0m\n' "$__sgr_rule" "${rule// /─}"
  fi
  __blk_first=

  # Cabecera: directorio, rama git y duración del comando anterior.
  local dir=${PWD/#$HOME/\~} branch=
  if command -v git >/dev/null 2>&1; then
    branch=$(git symbolic-ref --short -q HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
  fi
  local off='\[\e[0m\]'
  local head="$(__ps "$__sgr_dir")${dir//\\/\\\\}${off}"
  [[ -n $branch ]] && head+=" $(__ps "$__sgr_git")git:($(__ps "$__sgr_branch")${branch}$(__ps "$__sgr_git"))${off}"
  [[ -n $dur ]] && head+=" $(__ps "$__sgr_dim")(${dur}s)${off}"

  # \e]0;…\a pone el título de la pestaña con el directorio actual.
  PS1="\[\e]0;${dir//\\/\\\\}\a\]${head}\n"
  __blk_in_prompt=
  return $ec
}
PROMPT_COMMAND=__blk_prompt
PS2="$(__ps "$__sgr_dim")…${off:-\[\e[0m\]} "

[[ ${BLE_VERSION-} ]] && ble-attach
