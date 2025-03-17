#/usr/bin/env bash

case $1 in
--cat) # {{{
  case $2 in
  default-phrase) # {{{
    cat <<-EOF
			init: 3x6, 1, +10
			seed: default-phrase, 0x25c1d7c5/0xf8a0c3a
			1: ryPfos-zid6iv-tyqbuf
			2: bubnir-ynadzu-iwL9vo
			3: ugc5fy-gilavZ-ivbajj
			4: mOfjof-cyjvaz-0kipyj
			5: vifquc-Qugo1v-puwhat
			6: 7dIzpo-molocl-wetcoq
			7: qopsA3-jyless-fapsih
			8: zUm2ah-rykqyh-bydmym
			9: yr9owJ-quczid-elweft
			10: edsadj-p5cihz-leNgot
		EOF
    ;; # }}}
  abc) # {{{
    cat <<-EOF
			init: 3x6, 1, +10
			seed: abc, 0x17862/0x7fa1e71d
			1: gevgyp-zyrwuc-K3ukdi
			2: vabarp-atvuGo-qomg1a
			3: sepqus-abreh3-zyMbus
			4: zy3tYs-ywbiml-dyjvos
			5: 5miwsY-ikcosw-duzmon
			6: Cum8et-limraw-olqojk
			7: gumiwc-Mosocr-se7gik
			8: hurZik-syc1wi-kengeb
			9: gyngin-Egizl1-lynbyq
			10: nybjot-Gewmef-3ziwhe
		EOF
    ;; # }}}
  esac
  exit 0;; # }}}
--check) # {{{
  phrase="$2"
  shift 2
  diff <(node ios-pwd.mjs --phrase "$phrase") <($0 --cat "$phrase")
  exit $?;; # }}}
'') # {{{
  err=0
  for p in default-phrase abc; do
    err=$((err * 2))
    $0 --check $p>/dev/null && { echo "check-ok   : $p"; continue; }
    err=$((err + 1))
    echo "check-FAIL : $p"
    $0 --check $p | sed 's/^/  /'
  done
  exit $err;; # }}}
esac


