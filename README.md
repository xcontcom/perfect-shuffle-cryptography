## Perfect Shuffle Cryptography

This project demonstrates a minimalist, fully deterministic file encryption scheme built from perfect shuffle permutations

[Demonstartion of thext shuffling](https://xcont.com/shuffle_text/shuffle_text.html)

---

## How It Works (In a Nutshell)
* **Shuffling (Encryption)**:
    * Reads the input file (reefer.png) and converts it to a binary string.
    * Generates a random new key (newkey.txt) of the same length as oldkey.txt.
    * Prepends the new key to the file’s binary string.
    * Applies a series of shuffles (in-shuffle or out-shuffle) based on the bits in oldkey.txt.
    * Saves the shuffled result as reefer.data.
* **Unshuffling (Decryption)**:
    * Reads the shuffled file (reefer.data) and converts it to a binary string.
    * Reverses the shuffle sequence using oldkey.txt (in reverse order).
    * Splits the unshuffled binary string into the new key and the original file data.
    * Saves the original file (reefer.png) and the recovered new key (newkey.txt).
* **Security**: The security hinges on the secrecy of oldkey.txt. The shuffle operations permute the binary string in a way that’s deterministic but appears random without the key. The new key being embedded in the shuffled data is a neat way to securely transmit it to the recipient (Jimmy) without a separate channel.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Serhii Herasymov  

sergeygerasimofff@gmail.com  

https://github.com/xcontcom
